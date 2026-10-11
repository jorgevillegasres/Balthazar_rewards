import test from 'node:test';
import assert from 'node:assert/strict';
import {createTextOperationStore,rejectedTextOperation} from '../lib/text-operations.ts';

const operation={operationId:'first',body:JSON.stringify({kind:'capture',text:'Crear tarea',revision:7,operationId:'first'})};
test('closing and reopening preserves the original request for recovery',()=>{
 const store=createTextOperationStore();store.begin('owner',operation);
 assert.deepEqual(store.pending('owner'),operation);
 assert.throws(()=>store.begin('owner',{operationId:'second',body:'{}'}),/UNRESOLVED_OPERATION/);
 assert.equal(store.pending('owner').body,operation.body);
});
test('pending text operations are isolated by owner',()=>{
 const store=createTextOperationStore();store.begin('one',operation);
 assert.equal(store.pending('two'),null);
 store.begin('two',{operationId:'second',body:'{}'});
 assert.equal(store.pending('one').operationId,'first');
 assert.equal(store.pending('two').operationId,'second');
});
test('an old response cannot clear a different operation',()=>{
 const store=createTextOperationStore();store.begin('owner',operation);
 store.resolve('owner','first');store.begin('owner',{operationId:'second',body:'{}'});
 store.resolve('owner','first');assert.equal(store.pending('owner').operationId,'second');
 store.resolve('owner','second');assert.equal(store.pending('owner'),null);
});
test('callers cannot mutate the saved request through returned objects',()=>{
 const store=createTextOperationStore();store.begin('owner',operation);
 const pending=store.pending('owner');pending.body='changed';
 assert.equal(store.pending('owner').body,operation.body);
});
test('a confirmed revision rejection permits a new operation without trapping recovery',()=>{
 const store=createTextOperationStore();store.begin('owner',operation);
 if(rejectedTextOperation(409,true))store.resolve('owner','first');
 assert.equal(store.pending('owner'),null);
 store.begin('owner',{operationId:'second',body:'updated-revision'});
 assert.equal(store.pending('owner').operationId,'second');
});
test('ambiguous server errors and an operation already processing keep recovery required',()=>{
 assert.equal(rejectedTextOperation(409,false),false);
 assert.equal(rejectedTextOperation(503,false),false);
 assert.equal(rejectedTextOperation(400,false),true);
 assert.equal(rejectedTextOperation(429,false),true);
});
