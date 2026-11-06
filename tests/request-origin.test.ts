import test from 'node:test'
import assert from 'node:assert/strict'
import {allowedWriteOrigin,csrfOriginEligible} from '../shared/request-origin'

test('开发时端口被去掉只进入会话令牌分支，不直接放行来源',()=>{
  assert.equal(allowedWriteOrigin('http://127.0.0.1','http://127.0.0.1:3000','http://127.0.0.1:3000',true),false)
  assert.equal(csrfOriginEligible('http://127.0.0.1','http://127.0.0.1:3000',true),true)
  assert.equal(csrfOriginEligible('http://127.0.0.1','http://127.0.0.1:3000',false),false)
  assert.equal(csrfOriginEligible('https://outside.example','http://127.0.0.1:3000',true),false)
})

test('开发环境按本机请求地址允许保存，即使 SITE_URL 仍指向预览端口',()=>{
  for(const host of ['127.0.0.1','localhost','[::1]']){
    const actual='http://'+host+':3000'
    assert.equal(allowedWriteOrigin(actual,'http://127.0.0.1:3109',actual,true),true)
  }
})

test('生产模式仍精确校验配置的 origin 与端口',()=>{
  assert.equal(allowedWriteOrigin('https://paper.example','https://paper.example','http://internal:3000',false),true)
  assert.equal(allowedWriteOrigin('http://127.0.0.1:3000','http://127.0.0.1:3109','http://127.0.0.1:3000',false),false)
})

test('伪造来源、空来源、路径、外站与不同端口均不获得本机例外',()=>{
  for(const source of [undefined,'null','https://evil.example','http://127.0.0.1:3999','http://127.0.0.1.evil.example:3000','http://127.0.0.1:3000/path','garbage']){
    assert.equal(allowedWriteOrigin(source,'http://127.0.0.1:3109','http://127.0.0.1:3000',true),false)
  }
  assert.equal(allowedWriteOrigin('https://evil.example','https://paper.example','https://evil.example',true),false)
})
