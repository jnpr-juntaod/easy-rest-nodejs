var VersionCache = require("./jmp-version-cache");

function UserTask() {
    VersionCache.call(this, ["user", "role", "capability", "task"], true);
}

extend(UserTask.prototype, VersionCache.prototype, {
    loadData: function(key) {

    }
});

module.export = UserTask;