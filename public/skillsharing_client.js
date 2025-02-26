function handleAction(state,action){
    if (action.type=="setUser"){
        localStorage.setItem("userName",action.user);
        return {...state,user:action.user};
    
    } else if (action.type=="setTalks"){
        return {...state,talks:action.talks}

    }else if (action.type=="newTalk"){
        fetchOk(talkURL(action.title),{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                presenter:state.user,
                summary:action.summary
            })
        }).catch(reportError);
    }else if (action.type== "deleteTalk"){
        fetchOk(talkURL(action.talk), {method:"DELETE"})
        .catch(reportError);
    }else if (action.type =="newComment"){
        fetchOk(talkURL(action.talk)+ "/comments",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                author:state.user,
                message:action.message
            })
        }).catch(reportError)
    }
    return state;
}

function fetchOk(url,options){
    return fetch(url,options).then(response =>{
        if (response.status < 400) return response;
        else throw new Error(response.statusText)
    })
}

function talkURL(title){
    return "talks/" + encodeURIComponent(title);
}

function reportError(error){
    alert(String(error))
}

function renderUserField(name,dispatch){
    return elt("lable",{},"Your name:",elt("input",{
        type:"text",
        value:name,
        onchange(event){
            dispatch({type:"setUser",user:event.target.value});
        }
    }))
}

function renderTalk(talk,dispatch){
    return elt(
        "section",{className:"talk"},
        elt("h2",null,talk.title," ",elt("button", {
          type:"button",
          onclick(){
            dispatch({type:"deleteTalk",talk:talk.title})
          }  
        },"Delete")),
        elt("div",null, "by ",
            elt("strong",null, talk.presenter)),
            elt("p",null,talk.summary),
            ...talk.comments.map(renderComment),
            elt("form", {
                onsubmit(event){
                    event.preventDefault();
                    let form=event.target;
                    dispatch({type:"newComment",
                        talk:talk.title,
                        message:form.elements.comments.comment.value});
                        form.reset();
                }
            },elt("input",{type:"text", name:"comment"})," ",
              elt("button",{type:"submit"},"Add comment")))
}

function renderComment(comment){
    return elt("p", {className:"comment"},
        elt("strong",null, comment.author),
        ": ", comment.message);
}

function renderTalkForm(dispatch){
    let title =elt("input", {type:"text"});
    let summary =elt("input", {type:"text"});

    return elt("form",{
        onsubmit(event) {
            event.preventDefault();
            dispatch({type:"newTalk",
                title:title.value,
                summary:summary.value })
        event.target.reset();
        }

    }, elt("h3",null,"Submit a Talk"),
       elt("lable",null,"Title: ", title),
       elt("lable",null, "Summary: ", summary),
        elt("button",{type:"submit"}, "Submit"));
}