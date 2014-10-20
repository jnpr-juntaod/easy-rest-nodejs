var VersionCache = require("./jmp-version-cache");

function UserCapability() {
    VersionCache.call(this, ['USER', 'RBAC_ROLE', 'RBAC_CAPABILITY'], false);
    this.rediskey = "user_capability";
    this.redisversionkey= "user_capability_version"
}

extend(UserCapability.prototype, VersionCache.prototype, {
    loadData: function(field, callback) {
        var me = this;
        var pm = Jx.JmpPersistence.instance({dataSource: "MySqlDS"});
        var tables = me._tables;
        pm.query("select c.name as capability from USER_Permission up left join Permission p on up.permissions_id = p.id left join RBAC_ROLE_RBAC_CAPABILITY rc on p.roleRef_id = rc.roles_id left join RBAC_CAPABILITY c on rc.caps_id = c.id where up.users_id= ?;", [field], function(err, result){
            if(err)
                callback(err);
            else {
                if(result!="") {
                    callback(null, result);
                }
            }
        });
    }
});

module.exports = new UserCapability();