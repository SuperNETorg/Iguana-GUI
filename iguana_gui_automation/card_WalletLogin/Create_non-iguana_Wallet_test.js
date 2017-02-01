// That test suite verify scenarios for Card: Wallet Login IGUANA and Non IGUANA MODE


//scenario 1: verify login button is present on iguana gui


describe('visiting iguana gui home page',function()
{

  // lauch the brwoser and navigate to index.html
  // Please change the file path if you have different locaiton for index.html file

  beforeEach(function() {
 

    

    exec = require('child_process').exec;
    child = exec("dogecoind -regtest -daemon; syscoind -regtest -daemon", function (error, stdout, stderr){
                             console.log('stdout: ' + stdout);
                             if (error !== null) {
                             console.log('exec error: ' + error);

                             }
                     });
                     
    browser.get('file:///home/kashif/Iguana-GUI/compiled/prod/index.html',3000);
    browser.get('file:///home/kashif/Iguana-GUI/compiled/prod/index.html',3000);
    

   // wait for brwoser to render the page completely. This isn't a good way but i just got this workaround. i will fix it later
    browser.wait(function(){
     return element(by.css('.page-title.text-shadow.ng-binding')).isDisplayed();
    })
  });

afterEach(function(){

 browser.manage().deleteAllCookies();


 exec = require('child_process').exec;
 child = exec("killall coind", function (error, stdout, stderr){
                             console.log('stdout: ' + stdout);
                             if (error !== null) {
                             console.log('exec error: ' + error);

                             }
                     });


});

 it('verify that login button is present on iguana gui',function()
 {
   var loginButton = element(by.css('.btn.row.btn-signin.ng-binding')).getText();
                      expect(loginButton).toContain('Log in');


});

});

//scenario 2: verify login button is present on iguana gui

describe('create wallet button',function()
{

 it('verify that create button is preset on iguana gui',function()
 {
   var createButton = element(by.css('.btn.row.btn-signup.ng-binding')).getText();
                      
                      expect(createButton).toContain('Create wallet');


});

});

//scenario3: verify iguana welcome logo appears on screen


describe('iguana welcome logo',function()
{

 it('verify that iguana welcome logo appears on iguana login screen',function()
 {
   var logoWelcome = element(by.css('.page-title.text-shadow.ng-binding')).getText();
                     expect(logoWelcome).toContain('Welcome to Iguana!');


});

});

//scenario4: verify iguana defination appears on screen


describe('iguana defination message',function()
{

 it('verify that iguana defination message appears on iguana login screen',function()
 {
   var iguanaDef = element(by.css('.advanced-benefits.ng-binding')).getText();
                   expect(iguanaDef).toContain('Iguana is an app providing advanced benefits of cryptocurrencies and blockchain.');


});

});

//scenario4: verify OR text appears between Login and Create button


describe('Or text between login and create button',function()
{

 it('verify that or text appear between login and create button',function()
 {
   var logoWelcome = element(by.css('.login-or-delim.center.unselectable.ng-binding')).getText();
                     expect(logoWelcome).toContain('or');


});

});

//scenario5: creating Non-Iguana Wallet


describe('creating non-Iguana wallet',function()
{


 it('verify that user can create non-iguana wallet',function()
 {
 
 
  // storing passphrase for coins wallet, later those saved passphrase will be used to login to wallet
  function storePassphrase(passphrase,nameCoin){
   console.log('I m in storepassphrase()');
   protractor.promise.all([passphrase,nameCoin]).then(function(getinfo){
    var walletPassphrase = getinfo[0];
    var coin = getinfo[1];
    var filename = coin.replace(/(\r\n|\n|\r)/gm,"");

    var fs = require('fs');
        fs.writeFile(filename.toString(),walletPassphrase,function (err) {
        if (err) return console.log(err);
         console.log('Wrote!');
           });
        });

  }



   // click on create button
    function clickOnCreateButton(){   
      browser.sleep(2000);
      browser.wait(function(){
      return element(by.css('.btn.row.btn-signup.ng-binding')).isPresent();
      })
      var createButton = element(by.css('.btn.row.btn-signup.ng-binding')).click();
      
        walletType = element(by.css('.coins-title.ng-binding'));

          walletType.getText().then(function(gettext){           
          expect(gettext).toContain('Select a wallet type to create');
         });

       
    //    element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.after-flow-btn.ng-binding')).isPresent();

    var elm = element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.after-flow-btn.ng-binding'));
    elm.isPresent().then(function(result){
    if(result){
    elem.click();
    }
    else{
    console.log('Instruction page isnt available');
     }
    });
}

  function getActiveCoins(){
     console.log('I am in getActiveCoins() function'); 
     totalcoins = element.all(by.repeater('(name, item) in coins | filter: coinSearchModel'));
     totalcoins.then(function(activeCoins){
     for(ac=0; ac<activeCoins.length; ac++)
   
   {
        //creating wallet for active coins
        createWallet(ac,activeCoins.length);     
      }
    });
     
  }

  function createWallet(index,totalCoins){
   coinList = element.all(by.repeater('(name, item) in coins | filter: coinSearchModel'));
   namecoin = coinList.get(index).getText();
   coinList.get(index).getText().then(function(coiname){
   });
   coinList.get(index).click();
   browser.sleep(1000);
 var passphrase = element(by.css('.generated-passhprase.ng-binding')).getText();
                
                    element(by.css('.box')).click();
                    element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.btn-verify-passphrase.ng-binding')).click();
                    element(by.id('passphrase')).sendKeys(passphrase);
                    element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.btn-add-account.ng-binding')).click(); 
                 
   var acceptButton = element(by.css('.last-child.btn.btn-block.orange-gradient.not-hover.row.btn-terms-conditions-accept.ng-binding'));
               acceptButton.getText().then(function(isactive){
               console.log('Button =='+isactive);
               expect(isactive).toContain('Accept');
               element(by.css('.last-child.btn.btn-block.orange-gradient.not-hover.row.btn-terms-conditions-accept.ng-binding')).click();
                   });

                   browser.wait(function() {
                   return element(by.css('.modal-content .msg-body span')).isPresent();
                    })
       console.log('Going to click on screen');
      walletCreated = element(by.css('.modal-content')).element(by.css('.modal-header.msgbox-header.unselectable.ng-scope')).element(by.css('.ng-binding')).getText();
      expect(walletCreated).toContain('wallet is created');
 
         element(by.css('.modal.iguana-modal.message-container.msg-green.fade.ng-scope.ng-isolate-scope.in')).click();     
        

                     if(index < totalCoins-1)
                     {
                         storePassphrase(passphrase,namecoin);                
                         clickOnCreateButton();
                     }
                     else
                     {
                        storePassphrase(passphrase,namecoin);
                     }
                                      
  }// create wallet ends here               
    clickOnCreateButton();
    getActiveCoins();
                  
      }); //it ends here
}); //describe ends here


