wdefine(function(){
	var model = this.model("group_model");
	var instanceModel = this.model("instance_model");
	var serviceModel = this.model("service_model");
	model.on("selection", function(options){
		var instanceUrl = "/js/api/cloudstack/groups/" + options.selection.ids[0] + "/instances";
		var serviceUrl = "/js/api/cloudstack/groups/" + options.selection.ids[0] + "/servicespacks";
		instanceModel.url(instanceUrl);
		serviceModel.url(serviceUrl);
		instanceModel.reload();
		serviceModel.reload();
	});
});