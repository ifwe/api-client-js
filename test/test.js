var taggedApi = require('../lib/index.js');
var httpAdapter = require('../lib/http_adapter/node');
var http = new httpAdapter();

var api =  new taggedApi('http://www.tag-stage.com/api/',
                        {   application_id:'user',
                            format:'JSON',
                            session_token:'jtupjmf7ta9a3so6hhans004q2'
                        }, 
                    http);

api.execute('tagged.alerts.get', 
            {'count':7,
            api_signature: '',
            track: '6HKINAJMkK'})
.then(function(result) { 
    console.log(result); 
});