window.firstOpen = false;
function fetchNotes(){
  //Fetch notes form database
  document.querySelector('.pages-holder').innerHTML='';
  chrome.runtime.sendMessage({command: "fetchNotes", data: {notes: ''}}, (response) => {
    //listen for a response...
    var notes = response.data;
    var nav = '<ul>';
    window.notes = [];
    for(const noteId in notes){
      nav += '<li data-noteId="'+noteId+'">'+notes[noteId].icon+' '+notes[noteId].title+'</li>';
      window.notes[noteId] = notes[noteId];
    }
    nav += '</ul>';
    document.querySelector('.pages-holder').innerHTML = nav;

    //list for clicks
    listenForClicks();
  });

}

function clearNote(){
  //Clear note variables and action
  document.querySelector('.deletePage').style.display='none';

  //title
  document.querySelector('.holder h1').innerText = '';
  document.querySelector('.holder .post-body').innerHTML = '';
  document.querySelector('.holder .icon').innerText = '📃';
  document.querySelector('.holder h1').removeAttribute('data-noteid');
}
function changePage(noteId){
  //Change selected note
  var obj = window.notes[noteId];
  document.querySelector('.holder .icon').innerText = obj.icon;
  document.querySelector('.holder h1').innerText = obj.title;
  document.querySelector('.holder h1').dataset.noteid = noteId;
  document.querySelector('.holder .post-body').innerHTML = obj.body;

  var lis = document.querySelectorAll('ul li');
  for(var i = 0; i < lis.length; i++){
    try{
      lis[i].classList.remove('active');
    }catch(e){//...
    }
  }
  document.querySelector('ul li[data-noteid="'+noteId+'"]').className='active';

  document.querySelector('.savePage').style.display='block';
  document.querySelector('.deletePage').style.display='block';

  localStorage.setItem('_notes_lastOpenPage', noteId);
}

//Set click eventListeners  (only called once per page)
document.querySelector('.newNote').addEventListener('click', function(){
  clearNote();
});

document.querySelector('.deletePage').addEventListener('click', function(){
  var id = false;
  try{
    id = document.querySelector('.holder h1').dataset.noteid;
  }catch(e){ //...
  }
  if(id != false){
    var confirm = window.confirm('Are you sure you want delete this note?');
    if(confirm){
      chrome.runtime.sendMessage({command: "deleteNote", data: {id: id }}, (response) => {
        //...
        fetchNotes();
        clearNote();
      });
    }
  }

});
document.querySelector('.savePage').addEventListener('click', function(){
  //
  var title = document.querySelector('.holder h1').innerText;
  var body = document.querySelector('.holder .post-body').innerHTML;
  var icon = document.querySelector('.holder .icon').innerText;
  var id = document.querySelector('.holder h1').dataset.noteid;
  savePage(id, title, icon, body);
});

function savePage(id, title, icon, body){
  if(!title){
    alert('Please enter a title!');
    return false;
  }
  if(id == undefined){
    id = 'NO ID';
  }else{
    window.notes[id].title = title;
    window.notes[id].icon = icon;
    window.notes[id].body = body;
    document.querySelector('.pages-holder li[data-noteid="'+id+'"]').innerText=icon+' '+title;
  }

  chrome.runtime.sendMessage({command:"postNote", data: {id: id, title:title, body: body, icon:icon}}, (response) => {
    //....
    try{
      var obj = response;
      document.querySelector('.holder h1').dataset.noteid = obj.id;
      localStorage.setItem('_notes_lastOpenPage', obj.id);
      document.querySelector('.deletePage').style.display='block';
    }catch(e){
      console.log(e);
    }
    fetchNotes();
  });
}

function listenForClicks(){
  var lis = document.querySelectorAll('.pages-holder ul li');
  console.log(lis);
  for(var i = 0; i < lis.length; i++){
    lis[i].addEventListener('click', function(){
      changePage(this.dataset.noteid);
    });
  }
  if(window.firstOpen == false){
    window.firstOpen = true;
    try{
      var openNote = localStorage.getItem('_notes_lastOpenPage');
      if(openNote != ''){
        document.querySelector('ul li[data-noteid="'+openNote+'"]').click();
      }
    }catch(e){
      //
      console.log(e);
    }
  }
}

//runs fetch notes when page loaded
fetchNotes();

//emoji button
var button = document.querySelector(".holder .icon");
var picker = new EmojiButton();

button.addEventListener('click', () => {
    picker.togglePicker(button);
})
picker.on('emoji', emoji => {
    button.innerText = emoji;
});
