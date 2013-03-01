$.ajaxSetup({
	type: "POST",
	contentType: "application/json; charset=utf-8",
	dataType: "json",
	cache:false,
	url: "/",
	processData:false,
});
$.ajaxPrefilter(function(options){
	if($.isArray(options.data)){
		$.each(options.data,function(i,v){
			$.extend(options.data[i],{jsonrpc:"2.0",id:Math.floor(Math.random() * 0x10000).toString(16)});
		});
	} else {
		$.extend(options.data,{jsonrpc:"2.0",id:Math.floor(Math.random() * 0x10000).toString(16)});
	}
	options.data=JSON.stringify(options.data);
});

function call(method,args,success='function(data){console.log(data.result);}'){
	$.ajax({
		data:{method:method,params:args},
		success:success,
	});
}
