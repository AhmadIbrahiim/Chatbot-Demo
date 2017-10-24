var mysql = require("mysql");
var facebook = require('./app.js')
var Promise = require('bluebird')


var connection = mysql.createConnection({
  host: 'prayerconnection.cr9xax1d2k8r.us-west-2.rds.amazonaws.com',
  user: 'prayer',
  password: 'qoln5n5ayad',
  database: 'Prayer'
});
setInterval(function () {
  connection.query('SELECT 1');
}, 5000);

function Step(ID, target, val) {
  return new Promise((res, rej) => {
    if (target == 'get') {
      QueryBuilder("SELECT * from user where ID=?", [ID], (ca) => {
        if (ca.length == 0) {

          QueryBuilder("insert into user (ID,step) values (?,?)", [ID, 'user'], (xx) => { })
          res([{ step: 'new' }])


        }
        else {
          res(ca)
        }

      })
    }
    else if (target == 'lang') {
      QueryBuilder("update user set lang=? where ID=?", [val, ID], (xs) => { res(xs) });

    }
    else if (target == 'set') {
      QueryBuilder("update user set step=? where ID=?", [val, ID], (xs) => { res(xs) });
    }
  })
}

function InseryPayload(key,text,option)
{
  return new Promise((res,rej)=>{
  

     QueryBuilderA("Insert into payload values (?,?,?)",[key,text,option]).catch(er=>
      {
        QueryBuilderA("update payload set text=? , options=? where key=?",[text,option,key]).catch(x=>{console.log(x)})  
        
      })
    
      
  

  })
}
function QueryBuilder(query, prams, callback) {
  connection.query(query, prams, (err, data) => {
    if (err)
      console.log(err);
    else
      callback(data);
  })
}
function QueryBuilderA(query, prams) {
  return new Promise((res,rej)=>{
  connection.query(query, prams, (err, data) => {
    if (err)
    {
      console.log(err);
      rej("err");      
    }
    else
      res(data);
  })
})
}


module.exports =
  {
    Step: Step,
    InseryPayload
  }


