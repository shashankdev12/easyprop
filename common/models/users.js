'use strict';
let app = require('../../server/server');
let randomstring = require("randomstring");

module.exports = function(User) {

  User.saveUserInfo = function(req, cb)
  {
    let userModel = app.models.users;
    let reqObject = req.res.req;
    //let aData = JSON.parse(reqObject.body.data);
    let aData =reqObject.body[0];

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
          let obj={};
          if(aData.socialUser ==1)
          {
            obj={email:aData.email,username:aData.email,password:null,type:aData.type,firstName:aData.firstName,lastName:aData.lastName,created:new Date(),status:1}
          }
          else
          {
            obj={email:aData.email,username:aData.email,password:aData.password,phone:aData.phone,type:aData.type,status:1,firstName:aData.firstName,lastName:aData.lastName
              ,created:new Date()}
            }

            if(aData.type != "")
            {
              userModel.create(obj, function(err, userInstance)
              {
                if(err)
                {
                  console.log(err);
                }
                else
                {
                  userInstance.createAccessToken(864000, function(err, token) {
                    if (err)
                    {
                      cb(null, {
                        status: "failure",
                        message: "An Error has occurred, Please Try Again"
                      });
                    }
                    else
                    {
                      var myMessage = {firstName:aData.firstName};
                      var renderer = loopback.template(path.resolve(__dirname,'../../server/views/email/registrationConfirm.html'));
                      var html_body = renderer(myMessage);

                      loopback.Email.send({
                        to: aData.email,
                        from: 'himgiriadventurechopta@gmail.com',
                        subject: "Easy Property",
                        html: html_body,
                      },function(err, result) {
                        if(err)
                        {
                          console.log(err)
                          //return cb(err);
                        }
                        else
                        {
                          console.log("send");
                          //return cb(null,"Reset password link has been sent!");
                        }
                      });

                      cb(null,{status:1,message:"dataSaved",data:userInstance,token_id:token})
                    }
                  })
                }
              });
            }
            else
            {
              cb(null,{status:0,message:"Type is null",data:null,token_id:null});
            }
          }
          else
          {
            userData.createAccessToken(864000, function(err, token)
            {
              if (err)
              {
                cb(null, {
                  status: "failure",
                  message: "An Error has occurred, Please Try Again"
                });
              }
              else
              {
                cb(null,{status:2,message:"Already Saved",data:userData,token_id:token})
              }
            })
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

    User.userlogin = function(req,cb)
    {
      let userModel = app.models.users;
      let reqObject = req.res.req;
      let aData = reqObject.body[0];

      userModel.login({
        username: aData.email,
        password: aData.password
      }, function(err, token)
      {
        if (err)
        {
          console.log(err);
          cb(null,{status:0,data:"Wronge username /password"});
          //res.redirect('/index');
        }
        else
        {
          userModel.findOne({where:{id:token.userId}},function(err,userDat){
            if(err)
            {
              console.log(err);
              cb(null,{status:0,data:"wrong username / password"});
            }
            else
            {
              cb(null,{status:1,token:token.id,data:userDat});
            }
          });
        }
      });
    }

    User.remoteMethod(
      'userlogin', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{
          arg: 'data',
          type: 'Object'
        }],
        http: {
          path: '/userlogin',
          verb: 'post'
        }
      }
    );


    User.forgotPassword = function(req,cb)
    {
      let userModel = app.models.users;
      let aData =reqObject.body[0];
      console.log(aData);
      userModel.findOne({where:{email:aData.email}},function(err,data)
      {
        if(err)
        {
          console.log(err);
        }
        else
        {
          if(data)
          {
            let randomNumber = randomstring.generate();
            userModel.updateAll({id:data.id},{forgotLink:randomNumber},function(err,data)
            {
              var myMessage = {firstName:data.firstName,link:randomNumber};
              var renderer = loopback.template(path.resolve(__dirname,'../../server/views/email/forgotPassword.html'));
              var html_body = renderer(myMessage);

              loopback.Email.send({
                to: req.body.email,
                from: 'himgiriadventurechopta@gmail.com',
                subject: "Easy Property",
                html: html_body,
                },function(err, result)
                {
                  if(err)
                  {
                    console.log(err)
                  }
                  else
                  {
                    cb(null,{status:1,message:"user Found"});
                  }
                });
            })
          }
          else
          {
            cb(null,{status:0,message:"No User Found"})
          }
        }
      })
    }

    User.remoteMethod(
      'forgotPassword', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{
          arg: 'data',
          type: 'Object'
        }],
        http: {
          path: '/forgotPassword',
          verb: 'post'
        }
      }
    );


    /* ================= Change Password ========== */

    User.changePassword = function(req,cb)
    {
      let userModel = app.models.users;
      let aData =reqObject.body[0];

      userModel.findOne({where:{forgotLink:aData.link}},function(err,data)
      {
        if(err)
        {
          cb(null,{status:0,message:"issue err"})
        }
        else
        {
          if(data)
          {
            data.updateAttribute('password', adata.newPassword, function(err, user)
            {
              if(err)
              {
                cb(null,{status:0,message:"issue"})
              }
              else
              {
                userModel.updateAll({id:data.id},{forgotLink:aData.link},function(err,updateLink)
                {
                  cb(null,{status:1,message:"Your password is changed"})
                })
              }
            });
          }
          else
          {
            cb(null,{status:0,message:"No User Found"})
          }
        }
      })
    }

    User.remoteMethod(
      'changePassword', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{
          arg: 'data',
          type: 'Object'
        }],
        http: {
          path: '/changePassword',
          verb: 'post'
        }
      }
    );

    /* Edit Profile*/

    User.editProfile = function(req,cb)
    {
      let userModel = app.models.users;
      let aData =reqObject.body[0];

      userModel.findOne({where:{id:aData.id}},function(err,data)
      {
        if(err)
        {
          console.log(err);
        }
        else
        {
          userModel.updateAll({id:aData.id},{firstName:aData.firstName,lasttName:aData.lastName,phone:aData.phone},function(err,data)
          {
            if(err)
            {
              console.log(err);
            }
            else
            {
              cb(null,{status:1,message:"updated"})
            }
          })
        }
      })
    }

    User.remoteMethod(
      'editProfile', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{
          arg: 'data',
          type: 'Object'
        }],
        http: {
          path: '/editProfile',
          verb: 'post'
        }
      }
    );

    /* change Password */

    User.editPassword = function(req,cb)
    {
      let userModel = app.models.users;
      let reqObject = req.res.req;
      let aData = reqObject.body[0];

      userModel.findOne({where:{id:aData.id}},function(err,data)
      {
        if(err)
        {
          cb(null,{status:0,message:"issue err"})
        }
        else
        {
          if(data)
          {
            userModel.login({username: data.username,password: aData.currentPassword
            }, function(err, token)
            {
              if(err)
              {
                reject(0);
              }
              else
              {
                if(token)
                {
                  data.updateAttribute('password', adata.newPassword, function(err, user)
                  {
                    if(err)
                    {
                      cb(null,{status:0,message:"issue"})
                    }
                    else
                    {
                      cb(null,{status:1,message:"Your password is changed"})
                    }
                  });
                }
                else
                {
                  cb(null,{status:0,message:"no user found"})
                }
              }
            })
          }
          else
          {
            cb(null,{status:0,message:"No User Found"})
          }
        }
      })
    }

    User.remoteMethod(
      'editPassword', {
        accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
        returns: [{
          arg: 'data',
          type: 'Object'
        }],
        http: {
          path: '/editPassword',
          verb: 'post'
        }
      }
    );

  };
