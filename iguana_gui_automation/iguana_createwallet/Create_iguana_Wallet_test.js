// That test suite verify scenarios for Card: Wallet Login IGUANA and Non IGUANA MODE


//scenario 1: verify login button is present on iguana gui


describe('visiting iguana gui home page',function()
{

  // lauch the brwoser and navigate to index.html
  // Please change the file path if you have different locaiton for index.html file

  beforeEach(function() {
 

    

    exec = require('child_process').exec;
    child = exec("rm -rf reports", function (error, stdout, stderr){
                             console.log('stdout: ' + stdout);
                             if (error !== null) {
                             console.log('exec error: ' + error);

                             }
                     });
                     
    browser.get('file:///home/kashif/v0.3/Iguana-application/compiled/prod/index.html',3000);
    
    

   // wait for brwoser to render the page completely. This isn't a good way but i just got this workaround. i will fix it later
    browser.wait(function(){
     return element(by.css('.page-title.text-shadow.ng-binding')).isDisplayed();
    })
  });

afterEach(function(){

 browser.manage().deleteAllCookies();

});

 it('verify that login button is present on iguana gui',function()
 {
   var loginButton = element(by.css('.btn.row.btn-signin.ng-binding')).getText();
                      expect(loginButton).toContain('Login');


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
   var logoWelcome = element(by.css('.login-or-delim.unselectable.ng-binding')).getText();
                     expect(logoWelcome).toContain('or');


});

});

//scenario5: creating Iguana Wallet


describe('Verify 12 words passphrase generated successfully',function()
{


 it('verify that user can create iguana wallet',function()
 {
 
 
  // storing passphrase for coins wallet, later those saved passphrase will be used to login to wallet
   function storePassphrase(passphrase){
   console.log('I m in storepassphrase()');
   protractor.promise.all([passphrase]).then(function(getinfo){
    var walletPassphrase = getinfo[0];
    var filename = 'passphrase';

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
      var elm = element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.after-flow-btn.ng-binding'));
      elm.isPresent().then(function(result){
      if(result){
      elem.click();
      }
      else{
      console.log('Instruction page isnt available');
      }
     });

      browser.wait(function(){
      return element(by.css('.btn.row.btn-signup.ng-binding')).isPresent();
      })

      var createButton = element(by.css('.btn.row.btn-signup.ng-binding')).click();
      browser.wait(function(){
      return element(by.css('.generated-passhprase.ng-binding')).isPresent();
      });
      
   var getpassphrase = element(by.css('.generated-passhprase.ng-binding')).getText();
       storePassphrase(getpassphrase);
       element(by.css(".box")).click();  
       element(by.css(".btn.btn-block.orange-gradient.text-shadow.row.btn-verify-passphrase.ng-binding")).click();  
     
       
}
 
     clickOnCreateButton();
               
      }); //it ends here
}); //describe ends here

describe('Confirm 12-words passphrase generated successfully',function(){

  it('verify 12-word passphrase created by gui',function(){

 function confirmPassphrase(pass){
 console.log(pass);
 browser.sleep(3000);
 element(by.id('passphrase')).sendKeys(pass);
     
 }

  function getPassphrase(callback){

   var filename = 'passphrase';
   var fs = require('fs');
    fs.readFile(filename.toString(), function (err, passphrase) {
             if (err) {
                return console.error(err);
              }

              var pass = passphrase.toString();
              callback(pass);
   
     });
                                      
  }// confirm  walletPassphrase ends here       
        
     getPassphrase(function(passphrase){
       confirmPassphrase(passphrase);

      });
     
   browser.wait(function(){
   return  element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.btn-add-account.ng-binding')).isEnabled();
   });
 //    expect(createButton.getText()).toContain('Create');
    // browser.sleep(4000);
     element(by.css('.btn.btn-block.orange-gradient.text-shadow.row.btn-add-account.ng-binding')).click();

   }); //it block end here



}); // end describe here


