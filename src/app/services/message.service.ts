import {Injectable} from '@angular/core';

@Injectable()
export class MessageService {

  constructor() {
  }

  getMessage(term: any, type: string, properties?: any): Message {
    let msg: string;
    let params: {};
    switch (type) {
      case"targetSearch": {
        msg = 'MATCH (n:Target) WHERE n.name=~{qParam2} OR n.uniprot_id =~{qParam2} RETURN n.name, n.uniprot_id ORDER BY n.name LIMIT 100 UNION MATCH (n:Target) WHERE n.name=~{qParam} OR n.uniprot_id =~{qParam} RETURN n.name, n.uniprot_id ORDER BY n.name LIMIT 100';
        // msg = 'MATCH (n:Target) WHERE n.name=~{qParam2} RETURN n.name, n.uniprot_id ORDER BY n.name LIMIT 100';
        params = {qParam2: '(?i)' + term + '.*', qParam: '(?i).*' + term + '.*'};
        break;
      }
      case"patternSearch": {
        //msg = 'MATCH (n:Pattern) WHERE n.smiles=~{qParam} RETURN n.smiles, n.pid ORDER BY n.smiles LIMIT 50';
        msg = 'MATCH (n:Compound) WHERE n.hash=~{qParam} RETURN n.hash, n.pid ORDER BY n.hash LIMIT 50';
        params = {qParam: term + '.*'};
        break;
      }
      case"compoundSearch": {
        //msg = 'MATCH (n:Pattern) WHERE n.smiles=~{qParam} RETURN n.smiles, n.pid ORDER BY n.smiles LIMIT 50';
        msg = 'MATCH (n:Compound) WHERE n.hash=~{qParam} RETURN n.compound, n.lid ORDER BY n.compound LIMIT 50';
        params = {qParam: term + '.*'};
        break;
      }
      case "expand":
        switch (properties.target) {
          //todo: switch to parameterized  constraints for 'n'
          case "Target": {
            console.log(properties);
            // msg = 'MATCH p=shortestPath((t)-[r*..1]->(q:Target)) WHERE t.uuid = {qParam} return p LIMIT 100';
            msg ='MATCH (n:Target {uuid:{qParam}}) MATCH (n)-[r]-(b:Target) with {segments:[{start: startNode(r), relationship:r, end: endNode(r)}]} AS ret RETURN ret LIMIT 100';

            //  msg = 'MATCH (n {uuid: {qParam}) MATCH (n)-[r]-(b:Target) RETURN n, r, b LIMIT 100';
            break;
          }
          case "Compound": {
            //n = origin node
            msg ='MATCH (n: Target {uuid:{qParam}}) MATCH (n)-[r]-(b:Compound) with {segments:[{start: startNode(r), relationship:r, end: endNode(r)}]} AS ret RETURN ret LIMIT 100';
           // msg = 'MATCH (n: Target:Pattern) WHERE n.uuid = {qParam} MATCH (n)-[r]-(b:Compound) RETURN r LIMIT 100';
            break;
          }
          case "Pattern": {
            msg = 'MATCH (n) WHERE n.uuid = {qParam} MATCH (n)-[r]-(b:Pattern) RETURN r LIMIT 100';
            break;
          }
          case "All": {
            msg = 'MATCH (n) WHERE n.uuid = {qParam} MATCH (n)-[r]-(b) RETURN n, r, b LIMIT 100';
            break;
          }
        }
      {
        params = {qParam: term};
        break;
      }

      case "chembl":
      case "target": {
        msg = 'MATCH (n:Target) WHERE n.uniprot_id= {qParam} MATCH (n)-[r:REGULATES]-(b) RETURN n, r, b';
        params = {qParam: term};
        break;
      }
      case "targets": {
        console.log(term);
        msg = 'MATCH (n:Target) WHERE n.uuid IN {qParam} RETURN n';
        params = {qParam: term};
        break;
      }

      case "smiles": {
        msg = 'MATCH (n:Pattern) WHERE n.pid= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b LIMIT 5';
        params = {qParam: term};
        break;
      }

      case "compound": {
        msg = 'MATCH (n:Compound) WHERE n.compound= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b LIMIT 5';
        params = {qParam: term};
        break;
      }

      case "uuid": {
        msg = 'MATCH (n) WHERE n.uuid= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b';
        params = {qParam: term};
        break;
      }
      case "targetUUID": {
        console.log(term);
        msg ='MATCH (n:Target) WHERE n.uniprot_id IN {qParam} RETURN n.uuid AS data UNION MATCH (c:Compound) WHERE c.hash IN {qParam} RETURN c.uuid AS data';
      //  msg = 'MATCH (n:Target) WHERE n.uniprot_id IN {qParam} RETURN n UNION MATCH (n:Compound) WHERE n.hash IN {qParam} RETURN n';
        params = {qParam: term};
        break;
      }
      case "compoundUuid": {
        msg = 'MATCH (n) WHERE n.uuid= {qParam} MATCH (n)-[r]-(b) RETURN n, r, b';
        params = {qParam: term};
        break;
      }

      case "path": {
        let levels = properties.distance;
        msg = 'MATCH p=shortestPath((t)-[r:REGULATES*..' + levels + ']->(q:Target)) WHERE t.uniprot_id IN {start} AND q.uniprot_id IN {end} AND q.uniprot_id <> t.uniprot_id return p';
               params = {start: term.start, end: term.end};
        break;
      }

      case "node": {
        msg = 'MATCH (n:Target) WHERE n.uniprot_id= {qParam} RETURN n';
        params = {qParam: term};
        break;
      }
      //todo: this isn't paramaterized cypher doesn't support labels as parameters
      //todo: may need to just write separate calls based on origin node label
      case "counts": {
      //  console.log(term);
        msg = ' MATCH (n:Target) WHERE n.uuid = {qParam}  MATCH (n)-[r]-(b) RETURN DISTINCT labels(b),COUNT(labels(b))';
        params = {qParam: term};
        break;
      }

    }
    let message: Message = {
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

