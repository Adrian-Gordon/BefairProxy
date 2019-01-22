'use strict'
const nconf = require('../config/conf.js').nconf



const dir =nconf.get("dir")
const iterations= nconf.get("iterations")
const delay = nconf.get("delay")


const tasks = nconf.get("tasks")

let bashstring="sudo chmod a+rwx task*.sh\n"

for(let i=0; i< tasks.length; i++){
  const task = tasks[i]
  const marketid = task.marketid
  const tasktime = task.time

  const outstr = "echo \"sudo node " + dir + "/src/betfairproxy/marketts --conf=" + dir + "/testconfig.json --marketid=" + marketid + " --iterations=" + iterations + " --delay=" + delay + "\" > task" + i + ".sh"

  console.log(outstr)
  bashstring+= "sudo at -f " + dir + "/task" + i + ".sh " + tasktime + "\n"
}

console.log(bashstring)