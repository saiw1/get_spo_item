var spauth = require('node-sp-auth');
var request = require('request');  
var fs = require('fs');

require('dotenv').config();

var siteurl = '/sites/sai_test';
var listname = 'TestDocList';

var baseurl = process.env.url;

var dir = './listfiles';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

spauth.getAuth(baseurl, {
    username: process.env.user_name,
    password: process.env.userpw
})  
  .then(options => {
    let headers = options.headers;
    headers['Accept'] = 'application/json;odata=verbose';

    request.get(`${baseurl}${siteurl}/_api/web/lists/GetByTitle('${listname}')/items?$select=ID,Title&$expand=AttachmentFiles`, { headers: headers }, (err, response, body) => {			
		
        if (err){
            console.log(err);
            return;
        }
        var jsonbody = JSON.parse(body);
        
        if (jsonbody.error) {
            console.log(jsonbody.error);
            return;
        }
        var results = jsonbody["d"]["results"];
        if (!results.length) {
            return;
        } 

        results.forEach(item => {
            console.log(item.Title);
            if (item["AttachmentFiles"] && item["AttachmentFiles"].results.length) {
                if (!fs.existsSync(dir + '\\' + item.ID)){
                    fs.mkdirSync(dir + '\\' + item.ID);
                }
                item["AttachmentFiles"].results.forEach(attachitem => {
                    //console.log(attachitem);
                    request.get(`${baseurl}${siteurl}/_api/web/GetFileByServerRelativeUrl('${attachitem.ServerRelativeUrl}')/$value`, { headers: headers, encoding: null }, (err, res, body) => {
                        fs.writeFile(dir + '\\' + item.ID + '\\' + attachitem.FileName, body,  "binary",function(err) { });
                    });
                });
            }
        });
        //console.log(results);

    });
  });