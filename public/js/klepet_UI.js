function divElementEnostavniTekst(sporocilo) {
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;
  var jeTudSlika = sporocilo.indexOf('class="slika"') > -1;
  var jeVideo = sporocilo.indexOf('class="video"') > -1;
  if (jeSmesko || jeTudSlika || jeVideo) {
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  }
  else {
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }
}

function divElementHtmlTekst(sporocilo) {
  return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
  sporocilo = dodajSmeske(sporocilo);
  sporocilo = dodajSliko(sporocilo);
  sporocilo = dodajVideo(sporocilo);

  var sistemskoSporocilo;

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  }
  else {
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }

  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "",
  trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split('\r\n');
});

function filtirirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b', 'gi'), function() {
      var zamenjava = "";
      for (var j = 0; j < vulgarneBesede[i].length; j++)
        zamenjava = zamenjava + "*";
      return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
    }
    else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });

  socket.on('sporocilo', function(sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
  });
<<<<<<< HEAD

=======
  
  socket.on('dregljaj', function (dregljaj){
    $('#vsebina').jrumble();
    $('#vsebina').trigger('startRumble');
    setTimeout(function(){
      $('#vsebina').trigger('stopRumble');
    }, 1500);
    
  });
  
>>>>>>> dregljaj
  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();

    for (var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
  });

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i = 0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
    $('#seznam-uporabnikov div').click(function() {
      $('#poslji-sporocilo').val('/zasebno \"'+ $(this).text() +'\" ');
      $('#poslji-sporocilo').focus();
    });

  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {
      kanal: trenutniKanal
    });
  }, 1000);

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });


});

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  }
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}

function dodajSliko(vhodnoBesedilo){
  var besede = vhodnoBesedilo.split(" ");
  for(var i = 0; i < besede.length; i++){
    if(besede[i].startsWith('http') && (besede[i].endsWith(".gif") || besede[i].endsWith("png") || besede[i].endsWith("jpg"))){
      vhodnoBesedilo = vhodnoBesedilo.concat('<img src="'+besede[i]+'" class="slika" >');
    }
  }
  return vhodnoBesedilo;
}

function dodajVideo(vhodnoBesedilo){
  var besede = vhodnoBesedilo.split(" ");
  for(var i = 0; i < besede.length; i++){
    if(besede[i].startsWith('https://www.youtube.com/watch?v=')){
      besede[i] = besede[i].slice(0,24)+'embed/'+besede[i].slice(32);
      vhodnoBesedilo = vhodnoBesedilo.concat('<iframe src="'+besede[i]+'" class="video" allowfullscreen></iframe>');
    }
  }
  return vhodnoBesedilo;
}