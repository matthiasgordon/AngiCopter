/*
* Copyright 2011 Daniel X. Moore, http://www.html5rocks.com/en/profiles/#danielmoore
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

$(function() {
	  window.keydown = {};

	  function keyName(event) {
	    return jQuery.hotkeys.specialKeys[event.which] || String.fromCharCode(event.which).toLowerCase();
	  }

	  $(document).bind("keydown", function(event) {
	    keydown[keyName(event)] = true;
	  });

	  $(document).bind("keyup", function(event) {
	    keydown[keyName(event)] = false;
	  });
	});