const simpleGit = require('simple-git');
const git = simpleGit('/home/pablo/Documents/repos/nodeTasksPage/nodeTasks');


git.status().then(result => {

    console.log(result)

});

git.add('./index.md').commit("Changing data!").push();


