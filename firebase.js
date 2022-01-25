try{
  self.importScripts('firebase/firebase-app.js', 'firebase/firebase-auth.js', 'firebase/firebase-database.js');

  //firebase config
  var firebaseConfig = {
    apiKey: "AIzaSyBmeg5WTcorOx_29fbQETKvZnwimaKpZyA",
    authDomain: "notes-extension-bf718.firebaseapp.com",
    databaseURL: "https://notes-extension-bf718-default-rtdb.firebaseio.com",
    projectId: "notes-extension-bf718",
    storageBucket: "notes-extension-bf718.appspot.com",
    messagingSenderId: "189962244244",
    appId: "1:189962244244:web:5f64956c237327e974e481",
    measurementId: "G-4S0HVZSP46"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  console.log(firebase);

  var userId;
  chrome.identity.getProfileUserInfo(function(info){
    userId = info.id;
  })
  console.log(userId);

//  var email = 'no id'
  firebase.auth().signInAnonymously();
  // firebase.auth().onAuthStateChanged(firebaseUser => {
  //   if (userId == 'no id'){
  //     console.log(firebaseUser);
  //     userId = firebaseUser.uid;
  //   }
  // });


  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if(msg.command == 'fetchNotes'){
      firebase.database().ref('users/' + userId).once('value').then(function(snapshot){
        response({type: "result", status: "success", data: snapshot.val(), request: msg});
      });
    }

    if(msg.command == 'deleteNote'){
      var noteId = msg.data.id;
      if(noteId != ''){
        try{
          var deleteNote = firebase.database().ref('users/' + userId + '/' +noteId).remove();
          response({type:"result", status:"success", id: noteId, request: msg});
        }catch(e){
          console.log("error", e);
          response({type:"result", status:"error", data: e, request: msg});
        }
      }
    }

    if(msg.command == 'postNote'){
      var title = msg.data.title;
      var body = msg.data.body;
      var icon = msg.data.icon;
      var noteId = msg.data.id;

      try{
        if(noteId != 'NO ID'){
          var newNote = firebase.database().ref('users/' + userId + '/' +noteId).update({
            title: title,
            icon: icon,
            body: body
          });
          response({type: "result", status: "success", id:noteId, request: msg});
        }else{
          var newPostKey = firebase.database().ref().child('notes').push().key;
          var newNote = firebase.database().ref('users/' + userId + '/' +newPostKey).set({
            title: title,
            icon:icon,
            body:body
          });
          console.log('new note id', newPostKey);
          response({type: "result", status: "success", id:newPostKey, request: msg});
        }
      }catch(e){
        console.log("error", e);
        response({type: "result", status: "error", data:e, request: msg});
      }
    }
    return true;
  });
}catch(e){
  console.log(e);
}

