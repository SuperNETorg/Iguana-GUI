// That test suite verify scenarios for Card: No daemon running notificaiton



//scenario 1:

describe('visiting iguana gui home page',function()
{

  // lauch the brwoser and navigate to index.html
  // Please change the file path if you have different locaiton for index.html file

  beforeEach(function() {

    browser.get('file:///home/kashif/Iguana-GUI/compiled/prod/index.html',10000);

   // wait for brwoser to render the page completely. This isn't a good way but i just got this workaround. i will fix it later
    browser.sleep(5000);

  });


  it('Verify if no deamon running notification is appearing', function()
  {
    
    //chaining all the elements to find out text "No required daemon is running"

    var noDaemon = element(by.css('.modal-open')).element(by.css('.modal.iguana-modal.message-container.msg-red.fade.ng-scope.ng-isolate-scope.in')).element(by.css('.modal-dialog')).element(by.css('.modal-content')).element(by.css('.modal-header.msgbox-header.unselectable.ng-scope')).element(by.css('.msg-body')).element(by.css('.ng-binding.ng-scope')).getText();
   expect(noDaemon).toContain('No required daemon is running.');
  
  
});

});
    

//scenarios:2 find out if requirement link is present

describe('verify Requirement linktext',function()
{

  it('Verify Requirement linktext', function()
  {


    var linktext = element(by.css('.cursor-pointer.ng-binding')).getText();

   expect(linktext).toBe('requirements');


});

});


// Scenario 3: click on the requirement link and findout the requirement 


describe('verify Requirement linktext',function()
{

  it('Verify Requirement linktext', function()
  {


    var linktext = element(by.css('.cursor-pointer.ng-binding')).click();
    var gettext = element(by.css('.ng-binding')).getText();
    expect(gettext).toContain('Minimum daemon configuration to comminicate via http requests and a proxy server.');


});

});   
