'use strict';

module.exports = function(States)
{
  States.getStates = function(req, cb)
  {

    States.find({where:{country_id:101}},function(err,data)
    {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log(data.length)
        cb(null,{states:data});
      }
    })
  }


  States.remoteMethod(
    'getStates', {
      accepts: [{arg: 'req', type: 'object', http: function(req){return req}}],
      returns: [{
        arg: 'data',
        type: 'Object'
      }],
      http: {
        path: '/getStates',
        verb: 'post'
      }
    }
  );



};
