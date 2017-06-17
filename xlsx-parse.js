var xlsx = require("node-xlsx");
var fs=require("fs")
var list = xlsx.parse("shucai.xlsx");
var array=[];
let i=96
for(let value of list[0].data)
{
	let arr=[],obj={}
	for(let i=0;i<value.length;i++)
	{
		arr[i]=value[i]
	}
    for(let j=0;j<arr.length;j=j+2)
    {
        obj['id']=(i).toString()+'-'+String.fromCodePoint(65+j)
        if(j==6)
        {
            i++
        }
    	obj["food"]=arr[j];
    	obj["calorie"]=arr[j+1]
    	array.push(obj)
    	obj={}
    }
}
let object={'arr':array}
fs.open('./my_file1.txt', 'a', function opened(err, fd) {
    if (err) { throw err; }
    var writeBuffer = new Buffer(JSON.stringify(object)),
    bufferPosition = 0,
    bufferLength = writeBuffer.length, filePosition = null;
    fs.write( fd,
        writeBuffer,
        bufferPosition,
        bufferLength,
        filePosition,
        function wrote(err, written) {
           if (err) { throw err; }
           console.log('wrote ' + written + ' bytes');
        });
});
console.log(object.toString())