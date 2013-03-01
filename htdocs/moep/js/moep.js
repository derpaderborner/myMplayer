$(document).ready(function() {
var tabs={};
var accs={}
var time=0;
var length=0;
var isPaused=false;
var isMuted=false;
var pauseButton={true:"ui-icon-play",false:"ui-icon-pause"};
var muteButton={true:"ui-icon-volume-on",false:"ui-icon-volume-off"};
var intv=[];

// Get Mediasources
$.ajax({data:{method:"ls"},
	success: function(data){
		$.each(data.result.dirs,function(i,v){
			$("#tabs ul").append($("<li>").data("src",v)
				.append($("<a>").attr("href","").append(v)));
		});
		// Initialize tabs
		$("#tabs").tabs({
			beforeLoad: tabCallback
		});
		$( ".tabs-bottom .ui-tabs-nav > *" )
			.removeClass( "ui-corner-all ui-corner-top" )
			.addClass( "ui-corner-bottom" );
		$("#tabs .ui-tabs-nav")
			.removeClass("ui-corner-all ui-corner-bottom")
			.addClass("ui-corner-top");
		$( ".tabs-bottom .ui-tabs-nav" ).appendTo( ".tabs-bottom" );
	}
});

// Buttons
$("#overlay #buttons")
	.append($("<button>").data("method","pt_step").data("arg",-1)
		.button({icons:{primary:"ui-icon-seek-first"},text:false}))
	.append($("<button>").data("method","seek").data("arg",-10)
		.button({icons:{primary:"ui-icon-seek-prev"},text:false}))
	.append($("<button>").attr("id","pause").data("method","pause")
		.button({icons:{primary:"ui-icon-pause"},text:false}))
	.append($("<button>").attr("id","stop").data("method","stop")
		.button({icons:{primary:"ui-icon-stop"},text:false}))
	.append($("<button>").data("method","seek").data("arg",+10)
		.button({icons:{primary:"ui-icon-seek-next"},text:false}))
	.append($("<button>").data("method","pt_step").data("arg",+1)
		.button({icons:{primary:"ui-icon-seek-end"},text:false}))
	.append($("<button>").attr("id","mute").data("method","mute")
		.button({icons:{primary:"ui-icon-volume-off"},text:false,}));

$("#overlay button:data(method)").click(function(){
	call($(this).data("method"),[$(this).data("arg")]);
});
$("#overlay #pause").click(function(){
	isPaused=!isPaused;
	progbar();
	$(this).button({icons:{primary:pauseButton[isPaused]}});
});
$("#overlay #mute").click(function(){
	isMuted=!isMuted;
	$(this).button({icons:{primary:muteButton[isMuted]}});
 
});
$("#overlay #stop").click(update);
$(document).ajaxStop(function(){
	$("#loading>img").hide();
});
$(document).ajaxStart(function(){
	$("#loading>img").show();
});

// functions
function list(files,path){
	res=$("<div>").attr("id","browser");
	if(files.dirs){
		acc=$("<div>").attr("class","dirs");
		$.each(files.dirs,function(i,v) {
			acc.append($("<h3>").append(v).data("src",path+"/"+v));
			acc.append($("<div>"));
		});
		acc.accordion({
			active:false,
			animate:false,
			collapsible:true,
			beforeActivate:accordionCallback,
		});
		res.append(acc);
	}
	if(files.files){
		$.each(files.files,function(i,v){
			fl=$("<p>").attr("class","file").data("src",path+"/"+v);
			fl.append($("<span>").append(v));
			fl.append($("<button>").data("method","play").button({
				icons:{primary:"ui-icon-play"},
				text:false,
			}).click(play));
			fl.append($("<button>").data("method","append").button({
				icons:{primary:"ui-icon-plus"},
				text:false,
			}).click(play));
			res.append(fl);
		});
	}
	return res;
}
function play(){
	a=0
	if($(this).data("method")=="append")
		a=1
	$.ajax({data:{method:"mfile",params:["loadfile",$(this).parent().data("src"),a]}});
}
// Callbacks
function tabCallback(event,ui){
	if(ui.tab.length==0) return;
	src=ui.tab.data("src");
	if(tabs[src])
		ui.panel.html(list(tabs[src],src));
	else{
		$.ajax({data:{method:"ls",params:[src]},
			success: function(data){
				tabs[src]=data.result;
				ui.panel.html(list(data.result,src));
			}
		});
	}
	return false;
}
function accordionCallback(event,ui){
	if(ui.newHeader.length==0) return;
	src=ui.newHeader.data("src");
	if(accs[src])
		ui.newPanel.html(list(accs[src],src));
	else{
		$.ajax({data:{method:"ls",params:[src]},
			success: function(data){
				accs[src]=data.result;
				ui.newPanel.html(list(data.result,src));
				ui.newHeader.parents(".dirs").accordion("refresh");
			}
		});
	}
}
function sec2HMS(d) {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s); 
}
$("#time").progressbar({
	value:false,
	change: function() {
		$("#time .progress-label").text(sec2HMS(time)+"/"+sec2HMS(length));
	},
	complete: function() {
		update();
	}
});
function progbar(){
	if(isPaused) clearInterval(intv["getTime"]);
	else
		intv["getTime"]=setInterval(function(){
			time+=1;
			$("#time").progressbar("value",time/length*100);
		},1000);
}
function update(){
	$.ajax({data:[{method:"get_time_pos"},
			{method:"get_time_length"},
			{method:"get_file_name"},
			{method:"get_property",params:["pause"]},
			{method:"get_property",params:["mute"]}],
		success:function(data){
			if(typeof(data[3].result=="string") && data[3].result=="yes" || data[3].result=="no"){
				isPaused=(data[3].result=="yes")?true:false;
				$("#pause").button({icons:{primary:pauseButton[isPaused]}});
			}
			if(typeof(data[4].result=="string") && data[4].result=="yes" || data[4].result=="no"){
				isMuted=(data[4].result=="yes")?true:false;
				$("#mute").button({icons:{primary:muteButton[isMuted]}});
			}
			if(typeof(data[0].result)=="number" && typeof(data[1].result)=="number")
			{
				time=data[0].result;
				length=data[1].result;
				$("#time").progressbar("value",Math.floor(time/length*100));
				progbar();
			}
			if(typeof(data[2].result=="string") && $("current_title").text()!=data[2].result)
				$("#current_title").text(data[2].result);

			if(intv["update"]) clearInterval(intv["update"]);
			intv["update"]=setInterval(function(){update();},60000);
		}
	});
}
update();
});
