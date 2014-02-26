
var geocoder;
var map;
var marker;
var image = 'images/person2.png';
var infowindow = new google.maps.InfoWindow({maxWidth: 250});
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

// Get user lat/lng position
function userPos(){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(
			function(position){
				var user_lat = parseFloat(position.coords.latitude);
				var	user_lng = parseFloat(position.coords.longitude);
				console.log(user_lat);
				console.log(user_lng);
				initialize(user_lat, user_lng);
				codeLatLng(user_lat, user_lng);	
		});
	} else {
		alert("Geolocation is not supported or turned off");
	}
}
userPos();

//initialize map passing user lat/lng
function initialize(user_lat, user_lng){
	geocoder = new google.maps.Geocoder();
	directionsDisplay = new google.maps.DirectionsRenderer();
	var latlng = new google.maps.LatLng(user_lat,user_lng);
	var mapOptions = {
		zoom: 13,
		center: latlng,
		mapTypeId: 'roadmap',
		disableDefaultUI: true
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	marker = new google.maps.Marker({
		position: latlng,
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP, 
		icon: image	
		});
	directionsDisplay.setMap(map);
	autoComplete();
}

//set autocomplete
function autoComplete(){
	var pickupInput = (document.getElementById('pickup-loc'));
	var dropoffInput = (document.getElementById('searchTextField'));
	var autocompletePu = new google.maps.places.Autocomplete(pickupInput);
	var autocompleteDo = new google.maps.places.Autocomplete(dropoffInput);
	autocompletePu.bindTo('bounds', map);
	autocompleteDo.bindTo('bounds', map);
	google.maps.event.addListener(autocompletePu, 'place_changed', function(){
		infowindow.close();
		marker.setVisible(true);
		pickupInput.className = '';
		var place = autocompletePu.getPlace();
		// advise if place not found
		if(!place.geometry){
			pickupInput.className = 'notfound';
			return;
		}
		//if place has geommetry then show on map
		if(place.geometry.viewport){
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(15);
		}
		var address = "";
		if(place.address_components){
			address = [
				(place.address_components[0] && place.address_components[0].short_name || ""),
				(place.address_components[1] && place.address_components[1].short_name || ""),
				(place.address_components[2] && place.address_components[2].short_name || "")
			].join(" ");
		}
		infowindow.setContent(address);
		infowindow.open(map, marker);
	});
	google.maps.event.addListener(autocompleteDo, 'place_changed', function(){
		infowindow.close();
		marker.setVisible(false);
		dropoffInput.className = 'form-control';
		var place = autocompleteDo.getPlace();
		// advise if place not found
		if(!place.geometry){
			dropoffInput.className = 'notfound';
			return;
		}
		//if place has geommetry then show on map
		if(place.geometry.viewport){
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(15);
		}
		calcRoute();
		//autocomplete address components and set infowindow
		var address = "";
		if(place.address_components){
			address = [
				(place.address_components[0] && place.address_components[0].short_name || ""),
				(place.address_components[1] && place.address_components[1].short_name || ""),
				(place.address_components[2] && place.address_components[2].short_name || "")
			].join(" ");
		}
		infowindow.setContent(address);
		infowindow.open(map, marker);
	});
}

//reverse geocoder user lat/lng to address
function codeLatLng(user_lat, user_lng){	
	var latlng = new google.maps.LatLng(user_lat, user_lng);
	geocoder.geocode({'latLng': latlng}, function(results, status){
		if(status == google.maps.GeocoderStatus.OK){
			if(results[0]){
				map.setZoom(15);
				var results = results[0].formatted_address;
				infowindow.setContent(results);
				infowindow.open(map, marker);
				dragMarker(results);
				setAddr(results);
			} else {
				alert("No results found");
			}
		} else {
			console.log("Geocoder failed due to: "+status);
		}
	});
}

//event listener for dragging marker 
function dragMarker(results){
	google.maps.event.addListener(marker, 'dragend', function(event){
		console.log('new position is '+event.latLng.lat()+','+event.latLng.lng());
		var lat = parseFloat(event.latLng.lat());
		console.log(lat);
		var lng = parseFloat(event.latLng.lng());
		console.log(lng);
		codeLatLng(lat,lng);	
	});
}

//show optimal driving route on map
function calcRoute() {
  var start = document.getElementById('pickup-loc').value;
  console.log(start);
  var end = document.getElementById('searchTextField').value;
  console.log(end);
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

//populate pickup location field
function setAddr(results){
	$('#pickup-loc').val(results);
}

google.maps.event.addDomListener(window, 'load', initialize);

