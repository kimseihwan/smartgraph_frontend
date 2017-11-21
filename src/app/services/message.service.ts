import {Injectable} from '@angular/core';

@Injectable()
export class MessageService {

  constructor() {
  }

  getMessage(term: any, type: string, properties?: any): Message {
    let msg: string;
    let params: {};
    switch (type) {

      case 'chembl':
      case 'target': {
        msg = 'MATCH (n:Target) WHERE n.uniprot_id= {qParam} MATCH (n)-[r:REGULATES]-(b) RETURN n, r, b';
        params = {qParam: term};
        break;
      }

      case 'compound': {
        msg = 'MATCH (n:Compound) WHERE n.compound= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b LIMIT 5';
        params = {qParam: term};
        break;
      }

      case 'compoundSearch': {
        // msg = 'MATCH (n:Pattern) WHERE n.smiles=~{qParam} RETURN n.smiles, n.pid ORDER BY n.smiles LIMIT 50';
        msg = 'MATCH (n:Compound) WHERE n.hash=~{qParam} RETURN n.compound, n.lid ORDER BY n.compound LIMIT 50';
        params = {qParam: term + '.*'};
        break;
      }

      case 'counts': {
        switch (properties){
          case 'Target': {
            msg = 'MATCH (n:Target) WHERE n.uuid = {qParam}  MATCH (n)-[r]-(b) RETURN DISTINCT labels(b),COUNT(labels(b))';
            break;
          }
          case 'Compound': {
            msg = 'MATCH (n:Compound) WHERE n.uuid = {qParam}  MATCH (n)-[r]-(b) RETURN DISTINCT labels(b),COUNT(labels(b))';
            break;
          }
          case 'Pattern': {
            msg = 'MATCH (n:Pattern) WHERE n.uuid = {qParam}  MATCH (n)-[r]-(b) RETURN DISTINCT labels(b),COUNT(labels(b))';
            break;
          }
        }
        params = {qParam: term};
        break;
      }

      case 'endNodeSearch':
      case 'startNodeSearch': {
        // todo: convern nostereo_hash to a contains in hash search
        msg = 'MATCH (n:Target) WHERE n.uniprot_id IN {qParam} RETURN n AS data UNION MATCH (c:Compound) WHERE c.nostereo_hash IN {qParam} RETURN c AS data';
        //   msg = 'MATCH (n:Target) WHERE n.uniprot_id IN {qParam} RETURN n UNION MATCH (n:Compound) WHERE n.hash IN {qParam} RETURN n';
        params = {qParam: term};
        break;
      }

      case 'expand': {
        const start: string = 'MATCH (n:' + properties.origin;
        switch (properties.target) {
          // todo: switch to parameterized  constraints for 'n'
          case 'Target': {
            //  msg = 'MATCH p=shortestPath((t)-[r*..1]->(q:Target)) WHERE t.uuid = {qParam} return p LIMIT 100';
            msg = start + '{uuid:{qParam}}) MATCH (n)-[r]-(b:Target) with {segments:[{start: startNode(r), relationship:r, end: endNode(r)}]} AS ret RETURN ret LIMIT 100';
            break;
          }
          case 'Compound': {
            msg = start + '{uuid:{qParam}}) MATCH (n)-[r]-(b:Compound) with {segments:[{start: startNode(r), relationship:r, end: endNode(r)}]} AS ret RETURN ret LIMIT 100';
            break;
          }
          case 'Pattern': {
            msg = start + '{uuid:{qParam}}) MATCH (n)-[r]-(b:Pattern) with {segments:[{start: startNode(r), relationship:r, end: endNode(r)}]} AS ret RETURN ret LIMIT 100';
            break;
          }
          case 'All': {
            msg = 'MATCH (n) WHERE n.uuid = {qParam} MATCH (n)-[r]-(b) with {segments:[{start: startNode(r), relationship:r, end: endNode(r)}]} AS ret RETURN ret LIMIT 100';
            break;
          }
        }
        params = {qParam: term};
        break;
      }

      case 'node': {
        msg = 'MATCH (n:Target) WHERE n.uniprot_id= {qParam} RETURN n';
        params = {qParam: term};
        break;
      }

      case 'path': {
        const levels = properties.distance;
        // WHERE all(rel in r where rel.max_confidence_value > .3)
        const start = 'MATCH p=shortestPath((t)-[r*..' + levels + ']->(q:Target)) WHERE ';
        let confidence = '';
        let activity = '';
        let similarity = '';
        const where = '';

        if (properties.confidence) {
          confidence = ' all(rel in r where rel.max_confidence_value >' + properties.confidence + ') AND';
        }
        if (properties.activity) {
          activity = ' all(rel in r where rel.activity >' + properties.activity + ') AND';
        }
        if (properties.similarity) {
          similarity = ' all(rel in r where rel.ratio >' + properties.similarity + ') AND';
        }
        msg = start + confidence + activity + similarity + ' t.uuid IN {start} AND q.uuid IN {end} AND q.uuid <> t.uuid return p';
        params = {start: term.start, end: term.end};
        break;
      }

      case'patternSearch': {
        // msg = 'MATCH (n:Pattern) WHERE n.smiles=~{qParam} RETURN n.smiles, n.pid ORDER BY n.smiles LIMIT 50';
        msg = 'MATCH (n:Compound) WHERE n.hash=~{qParam} RETURN n.hash, n.pid ORDER BY n.hash LIMIT 50';
        params = {qParam: term + '.*'};
        break;
      }

      case 'prediction': {
        msg = 'MATCH (t:Target) WHERE t.uuid= {qParam} MATCH (t)<-[r1:POTENT_PATTERN_OF]-(p:Pattern) MATCH (p)-[r2:PATTERN_OF]->(c:Compound) WHERE NOT ((c)-[:TESTED_ON]->(t)) RETURN c,p,t,r1,r2 LIMIT 300';
        params = {qParam: term};
        break;
      }

      case 'smiles': {
        msg = 'MATCH (n:Pattern) WHERE n.pid= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b LIMIT 5';
        params = {qParam: term};
        break;
      }

      case'targetSearch': {
        msg = 'MATCH (n:Target) WHERE n.name=~{qParam2} OR n.uniprot_id =~{qParam2} RETURN n.name, n.uniprot_id ORDER BY n.name LIMIT 100 UNION MATCH (n:Target) WHERE n.name=~{qParam} OR n.uniprot_id =~{qParam} RETURN n.name, n.uniprot_id ORDER BY n.name LIMIT 100';
        //  msg = 'MATCH (n:Target) WHERE n.name=~{qParam2} RETURN n.name, n.uniprot_id ORDER BY n.name LIMIT 100';
        params = {qParam2: '(?i)' + term + '.*', qParam: '(?i).*' + term + '.*'};
        break;
      }

      case 'uuid': {
        msg = 'MATCH (n) WHERE n.uuid= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b';
        params = {qParam: term};
        break;
      }

    }
    const message: Message = {
      type: type,
      message: msg,
      params: params
    };
    return message;

  }

}

export interface Message {
  type: string;
  message: string;
  params: Object;
}

