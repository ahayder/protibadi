angular.module('starter.controllers', [])

.controller('AppCtrl', function($ionicPlatform, $cordovaToast, $scope, $ionicModal, $timeout, $cordovaBluetoothSerial, $ionicPopup) {


  // Disconnect protibaadi from bluetooth device

  $scope.disconnect = function(){
    $cordovaBluetoothSerial.disconnect().then(
      function(){
        $cordovaToast.showLongBottom('Disconnected');
      },
      function(){
        $ionicPopup.alert({
          title: "Disconnect ERROR!",
          template: "Something went wrong while disconnecting."
        });
      }
      );
  }
  
})



.controller('bluetoothCtrl',function ($http, $cordovaGeolocation, $cordovaToast, $cordovaBluetoothSerial, $scope, $timeout, $cordovaSms, NumberFactory, $ionicPlatform, $ionicPopup, $ionicLoading) {
  console.log("hmm");
  $ionicPlatform.ready(function() {
    $scope.checkBT = function (time) {
      $timeout(function () {

        // Checking bluetooth
        $cordovaBluetoothSerial.isEnabled().then(
          function(){
            $ionicPopup.alert({
              title: "Message",
              template: "Bluetooth is turned on, now pair with your bluetooth controller device from your phone. If already paired, ignor the message."
            });

          },
          function() {

            // turning on bluetooth
            $cordovaBluetoothSerial.enable().then(
                function(){
                  $cordovaToast.showLongBottom('Bluetooth is turned on.');
                },
                function(){
                  $ionicPopup.alert({
                    title: "Error",
                    template: "Cannot enable bluetooth."
                  });
                }
              );





        });

      },time); 
    };


    $scope.checkBT(750);
  });


  $scope.liste=function(){
     $cordovaBluetoothSerial.list().then(function(response){
        $scope.btlist = response;
        //console.log("BT list" + $scope.btlist);
      },  
      function(error){
        console.log(error);
      });
  }


  $scope.undiscoverdliste=function()
  {
      $cordovaBluetoothSerial.discoverUnpaired(event).then(function(result){
          $scope.btlist=result;
      },function(error){
          console.log("Err");
          $scope.btlist=error;
      });

  }


  // Sms sending

  $scope.sendSms = function(){

    var contacts = NumberFactory.getNumbers();

    // Getting locatoin info

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        var lat = position.coords.latitude
        var lng = position.coords.longitude


        // Getting the address

        var fullAddress = [];

        // Calling google geocode api
        $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key=AIzaSyDgnIKypSCajFw-fbf1Aon7GVsSVvoraJQ").then(function(response){
          var address = response.data.results[0].address_components;

          for(var i = 0; i < address.length; i++){
            fullAddress.push(address[i].short_name);
          }


          // removing duplicacy
          var tempObj = {};
          var j = 0;
          for(var i = 0; i < fullAddress.length; i++){
            
            tempObj[fullAddress[i]] = j;
            j++;

          }


          // Saving into array
          var finalAddress = [];
          for(key in tempObj){
            finalAddress.push(key);
          }


          send(lat, lng, finalAddress);

        });

      }, function(err) {
          $cordovaToast.showLongBottom("Sorry protibaadi can't sent your location");
          alert(err.code);
          //sendButNotLocation();
    });



    
    var send = function(lat, lng, address){

      //alert(lat + lng + address);

      var msg = NumberFactory.getMessage() || "I'm in danger. ";

      //alert(msg);

      if(contacts){
        var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
          android: {
            intent: '' // send SMS with the native android SMS messaging
              //intent: '' // send SMS without open any other app
              //intent: 'INTENT' // send SMS inside a default SMS app
          }
        };

        for(var i = 0; i < contacts.length; i++){
          $cordovaSms
            .send("0"+contacts[i].number, ""+ msg +"My location is following- Latitude: " + lat +" Longitude: "+ lng + " Address: "+ address, options).then(
              function() {
               $cordovaToast.showLongBottom("Sms sended to "+ contacts[i].name);
            }, function(error) {
              $ionicPopup.alert({
                 title: "Error!",
                 template: "Sms not send for " + error.message
                });
          });
        }

      }
      else{
        $ionicPopup.alert({
             title: "No Numbers Added Yet",
             template: "Please add a number" 
           });
      }
    }

    var sendButNotLocation = function(){

      var msg = NumberFactory.getMessage() || "I'm in danger. ";

      if(contacts){
        var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
          android: {
            intent: '' // send SMS with the native android SMS messaging
              //intent: '' // send SMS without open any other app
              //intent: 'INTENT' // send SMS inside a default SMS app
          }
        };

        for(var i = 0; i < contacts.length; i++){
          $cordovaSms
            .send("0"+contacts[i].number, msg + "Protibaadi couldn't get the location information", options)
            .then(function() {
               $cordovaToast.showLongBottom("Sms sended to "+ contacts[i].name);
            }, function(error) {
              $ionicPopup.alert({
                 title: "Error!",
                 template: "Sms not send for " + error
                });
          });
        }

      }
      else{
        $ionicPopup.alert({
             title: "No Numbers Added Yet",
             template: "Please add a number" 
           });
      }
    }

    
    

  }




  // Her ngCordova bluetooth serial use .then instead of pure bluetoothserial

  $scope.startLooking = function(){

    $cordovaToast.showLongBottom('Protibaadi is listening...');
    
    $cordovaBluetoothSerial.subscribe("#").then(
    function(greetings){
      $ionicPopup.alert({
           title: "Greetings!",
           template: greetings 
         });
    },
    function(seconde){
      $ionicPopup.alert({
           title: "Error!",
           template: seconde
         });
    },
    function(response){
      $cordovaToast.showLongBottom("Protibaadi detected danger, Sending sms to your contacts with your location.");
      $scope.sendSms();
    });
  }



  $scope.connectWithThis = function(address, name){

    $ionicLoading.show({
      template: '<ion-spinner class="spinner-energized" icon="android"></ion-spinner>'
    });

    $cordovaBluetoothSerial.connect(address).then(
      function() {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom('Connected with '+name).then(function(success) {
          $scope.startLooking();
        }, function (error) {
          // error
          $ionicPopup.alert({
           title: "Blutooth is not listening",
           template: "Somethin went wrong, try again." 
          });
        });

        
      },
      function() {
        $ionicLoading.hide();
        $ionicPopup.alert({
           title: "Not Connected",
           template: "Somethin went wrong, try again." 
         });
      }
    );

  };  


})


.controller('mobileNumberCtrl', ['$scope', '$ionicModal', 'NumberFactory', '$ionicPopup', 
  function ($scope, $ionicModal, NumberFactory, $ionicPopup) {

  $scope.mobileNumbers = NumberFactory.getNumbers();




  // add mobile number modal
  $ionicModal.fromTemplateUrl('templates/add-number-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeNumberModal = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.showNumberModal = function() {
    $scope.modal.show();
  };

  $scope.addNumber = function(info){
    
    if(NumberFactory.saveNumber(info)){
      $scope.mobileNumbers = NumberFactory.getNumbers();
      info.name = null;
      info.number = null;
      $scope.closeNumberModal();
      
    }
    else{
      $ionicPopup.alert({
        title: 'Error!',
        template: 'Opps! Something unusual happend'
      });
    }
  };

}])


.controller('messageCtrl', function ($scope, $state, NumberFactory, $ionicPopup) {

  $scope.saved = NumberFactory.getMessage();

  var confirm = function(){
    $ionicPopup.alert({
      title: 'Success!',
      template: 'Your message saved successfully.'
    }).then(function(){
      $state.go("app.message");
    });

    $scope.message = null;
  }
  
  $scope.save = function(msg){
    confirm();
    NumberFactory.saveMessage(msg);
    $scope.saved = NumberFactory.getMessage();

  }

  $scope.message = "";

  

})

.controller('mapCtrl', function ($scope, $ionicLoading) {

    console.log("Fuck!");


    var afuck = function(){
      $ionicLoading.show({
                template: 'Loading...'
            });

      google.maps.event.addDomListener(window, 'load', function() {
          var myLatlng = new google.maps.LatLng(24.760175, 90.404778);
   
          var mapOptions = {
              center: myLatlng,
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };
   
          var map = new google.maps.Map(document.getElementById("map"), mapOptions);
   
          navigator.geolocation.getCurrentPosition(function(pos) {
              map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
              var myLocation = new google.maps.Marker({
                  position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                  map: map,
                  title: "My Location"
              });
          });
   
          $scope.map = map;
      });

      $ionicLoading.hide();
    }

      

      
  

      afuck();
});

