'use strict';
let app = require('../../server/server');

module.exports = function(User) {

  User.saveUserInfo = function(req, cb)
  {
    console.log(11111111);
    let userModel = app.models.users;
    let aData ={username:"shashank",
                password:"123456",
                email:"shashank.shahi1705@gmail.com",
                phone:"789456123",
                type:1,
                firstName:"shashank",
                lastName:"shahi"
              }
      userModel.findOne({where:{email:aData.email}},function(err,userData)
      {
        if(err)
        {
          cb(null,{status:2,message:"err"})
        }
        else
        {
          if(userData === null)
          {
            userModel.create({email: aData.email,username:aData.username, password:aData.password,phone:aData.phone,
               type:1,created:new Date(),status:1,type:aData.type,firstName:aData.firstName,lastName:aData.lastName
               }, function(err, userInstance)
             {
               if(err)
               {
                 console.log(err);
               }
               else
               {
                 cb(null,{status:1,message:"dataSaved"})
               }
            });
          }
          else
          {
            cb(null,{status:2,message:"Already Saved"})
          }
        }
      })

  }

  User.remoteMethod(
      'saveUserInfo', {
          accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
          returns: [{
              arg: 'data',
              type: 'Object'
          }],
          http: {
              path: '/saveUserInfo',
              verb: 'post'
          }
      }
  );


};
