describe('login to non-iguana wallet',function(){

beforeEach(function() {

    exec = require('child_process').exec;
    child = exec("dogecoind -regtest -daemon; syscoind -regtest -daemon", function (error, stdout, stderr){
                             console.log('stdout: ' + stdout);
                             if (error !== null) {
                             console.log('exec error: ' + error);

                             }
                     });

    browser.get('file:///home/kashif/v0.3/Iguana-application/compiled/dev/index.html',3000);
     

   // wait for brwoser to render the page completely. This isn't a good way but i just got this workaround. i will fix it later
    browser.wait(function(){
     return element(by.css('.page-title.text-shadow.ng-binding')).isPresent();
    })
  browser.sleep(4000);

  });



it('verify dashboard settings',function(){

function presenceOfAll(elementArrayFinder) {
    return function () {
        return elementArrayFinder.count(function (count) {
            return count > 0;
        });
    };
}

function getpassphrase(whichCoin){
   console.log('I m in getpassphrase()');
    protractor.promise.all([whichCoin]).then(function(getinfo){
    var  coin = getinfo[0];
    var filename = coin.replace(/(\r\n|\n|\r)/gm,"");
   console.log('opening file from =='+coin);
    var fs = require('fs');
    fs.readFile(filename.toString(), function (err, passphrase) {
             if (err) {
                return console.error(err);
              }

             var pass = passphrase.toString();
             element(by.id('passphrase')).sendKeys(pass);
            console.log('Going to login with passphrase =='+pass);
            element(by.css('.btn.btn-block.row.btn-signin-account.form-control.ng-binding')).click();
            browser.sleep(2000);
           var setting = element(by.cssContainingText('.text.ng-binding', 'Settings'));
          expect(setting.getText()).toContain('Settings');
          setting.click();
           setting.isPresent().then(function(Settings){
           if(Settings){
           console.log('Dashboard settings are present');
           setting.click();
          }
          else{
          console.log('ERROR: Dashboard setting are missing');  
          }         

             });

           });
      });

}



function getLogintoWallet(index,totalCoins){
   var EC = protractor.ExpectedConditions;
   coinList = element.all(by.repeater('(name, item) in coins | filter: coinSearchModel'));
   browser.wait(presenceOfAll(coinList), 100000);
   var namecoin = coinList.get(index).getText();  
   coinList.get(index).click();
   browser.sleep(1000);
   getpassphrase(namecoin);

}


function activeCoins(){
    console.log('I am in getActiveCoins() function');
    totalcoins = element.all(by.repeater('(name, item) in coins | filter: coinSearchModel'));
    browser.wait(presenceOfAll(totalcoins), 1000000);
     totalcoins.then(function(activeCoins){
    for(ac=0; ac<1; ac++)
      {
        //creating wallet for active coins
        getLogintoWallet(ac,activeCoins.length);
      }
    });
  }
                          
              element(by.css('.row')).element(by.css('.btn.row.btn-signin.ng-binding')).click();

             var elm = element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.after-flow-btn.ng-binding'));
              elm.isPresent().then(function(result){
              if(result){
              elm.click();
               }
             else{
             console.log('Instruction page isnt available');
             }
          });
     
              activeCoins();


 });// ending it block

});// ending describe block

