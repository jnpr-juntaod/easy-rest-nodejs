wdefine(function(){
	var groupModel = this.model("group_model", {idAttribute: "name", url: "/js/api/cloudstack/groups", autoSelect: true});
	var instanceModel = this.model("instance_model", {lazyInit: true});
	var serviceModel = this.model("service_model", {idAttribute: "servicename", lazyInit: true});
	this.metadata("servicegroupstree", {idField: "name", dataTextField: "name", model: "group_model"});
	this.metadata("groupinstancesgrid", {model: 'instance_model', 
		columns : [
		           {"type":"string", "field":"id", "title": "Id","hidden":true, "width":"180px"},
		           {"type":"string", "field":"ip", "title": "Ip Address","hidden":false, "width":"180px"},
		           {"type":"string", "field":"port", "title":"Port", "hidden":false, width: "120px"},
		           {"type":"string", "field":"status", "title":"Status","hidden":false, width: "230px", template: deviceStateFormatter}
		          ],
		pageable: null,
		scrollable:false,
		selectable:"multiple,row",
		sortable:false,
		resizable:true, 
		reorderable:true
	});
	
	
	this.metadata("installedservicesgrid", {idField: "servicename", model: 'service_model', 
		columns : [
		           {"type":"string", "field":"servicepack", "title": "Service Pack", "hidden":false, "width":"180px", template: serviceNameFormatter},
		           {"type":"string", "field":"servicename", "title": "Service Name", "hidden":false, width: "120px"}
		          ],
		pageable: null,
		scrollable:false,
		selectable:"multiple,row",
		sortable:false,
		resizable:true, 
		reorderable:true
	});
	
	function serviceNameFormatter(dataItem) {
		var name = dataItem.get("servicepack");
		return '<div class="app_device_name_render"><span><a id="' + dataItem.get('id') + '" title="' + dataItem.get('name') + '">' + name + '</a></span><span class="app_floating_actions pull-right" style="display:none"><span class="k-icon k-i-pencil" style="margin-right:5px"></span><span class="k-icon k-i-close"></span></span></div>';
	}

    function deviceStateFormatter(dataItem) {
        var status = dataItem.get("devicestate");
        var image_path = "";
        if(status == 1) {
            image_path = "/devicemgmtui/tasks/devicemgmt/images/up.png"
        }
        else {
            image_path = "/devicemgmtui_state_render"><img src='+image_path+' style="margin-right:5px"></img></div>';
    }
});