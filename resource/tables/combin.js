var fs = require("fs");
var path = fs.realpathSync(".");

var data = {};
var index = 0;
var fileList = [];

var filterList = [];
var filterKeyMap = {};

fs.readdir(path, function(error, files)
{
    if (error)
    {
        console.log("read dir error....");
    }
    else
    {
        files.forEach(function(fullName)
        {
            var tempPath = path + "/" + fullName;

            fs.stat(tempPath, function(error_1, result)
            {
                index++;

                if (error_1)
                {
                    console.log("stat error....");
                }
                else
                {
                    if (result.isDirectory() == false)
                    {
                        if (fullName.substr(fullName.length - 5) == ".json")
                        {
                            var json = require(tempPath);
                            var fileName = fullName.substr(0, fullName.length - 5);

                            if (filterList.indexOf(fileName) < 0)
                            {
                                if (fullName != "data.json" && fullName != "error.json")
                                {
                                    fileList.push(fileName);
                                    data[fileName] = json;

                                    if (filterKeyMap[fileName])
                                    {
                                        for (var id in json)
                                        {
                                            var item = json[id];
                                            var delList = [];

                                            for (var key in item)
                                            {
                                                if (filterKeyMap[fileName].indexOf(key) < 0)
                                                {
                                                    delList.push(key);
                                                }
                                            }

                                            delList.forEach(function(key)
                                            {
                                                delete item[key];
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (index >= files.length)
                {
                    data["__fileList"] = JSON.stringify(fileList);
                    data["__shortName"] = compress(data);

                    fs.writeFile(__dirname + "/../resource/config/data.json", JSON.stringify(data), function(error_2)
                    {
                        if (error_2)
                        {
                            console.log(error_2);
                        }
                    });
                }
            })
        });
    }
});

function compress(data)
{
    var shortId = 1;
    var tempData = {};

    for (var table in data)
    {
        var json = data[table];

        for (var id in json)
        {
            var item = json[id];

            for (var key in item)
            {
                var existId = 0;

                for (var keyNum in tempData)
                {
                    if (tempData[keyNum] == key)
                    {
                        existId = keyNum;
                        break;
                    }
                }

                if (key.length > 2)
                {
                    if (existId == 0)
                    {
                        tempData[shortId] = key;
                        item[shortId] = item[key];

                        shortId++;
                    }
                    else
                    {
                        item[existId] = item[key];
                    }

                    delete item[key];
                }
            }
        }
    }
    return tempData;
}