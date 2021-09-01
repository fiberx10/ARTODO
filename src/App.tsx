import React, { FC } from "react";
import "./App.css";
import "./todo.css";
import $ from "jquery";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
const ArDB = require("ardb");
const arweave = Arweave.init({
  host: "localhost",
  port: 8080,
  protocol: "http",
});
const ardb = new ArDB.default(arweave);
  //******************* chnage between sign and signup */
  const tosgnup = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault;
    $(".sign_up_li").addClass("active");
    $(".sign_in_li").removeClass("active");
    $(".sign_up").removeClass("disp_none");
    $(".sign_in").addClass("disp_none");
  };
  const tosgnin = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault;
    $(".sign_in_li").addClass("active");
    $(".sign_up_li").removeClass("active");
    $(".sign_in").removeClass("disp_none");
    $(".sign_up").addClass("disp_none");
  };

















  const logout =(e:React.MouseEvent<HTMLElement>)=>{
    e.preventDefault;
    localStorage.removeItem("key");
    localStorage.removeItem("todolist");
    localStorage.removeItem("keyexist");
    window.location.reload() ;
    
  }





  async function gettodolist ()  {
  
    var key = localStorage.getItem("key");
    var ads = "";
    arweave.wallets.jwkToAddress(JSON.parse(key || "")).then((address) => {
      ads = address;
    });
    const txs = await ardb.search("transactions").findAll();
    if (txs.lenght == 0) return;
   
    let rdata =[]  ;
    txs.forEach((k: JWKInterface) => {
      if (k.owner.address == ads) {
        
    arweave.transactions
        .getData(k.id, { decode: true, string: true })
        .then((d) => {
         rdata = [...rdata , d.toString()]
        
         localStorage.setItem("todolist" , rdata ) ;
       });
      }

    });

}





async function submittodo() {

  var data = document.getElementsByClassName("input_data")[0];
  if (!data.value) return;

  var key = localStorage.getItem("key") ;

  let transaction = await arweave.createTransaction(
    {
      data: data.value,
    },
    JSON.parse(key)
  );
  transaction.addTag("App-Name", "aweave-todo");
  
  await arweave.transactions.sign(transaction, JSON.parse(key));
  let uploader = await arweave.transactions.getUploader(transaction);
  while (!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  }
}





function getLS(){
  let a = localStorage.getItem("todolist")  || "";
  console.log("it's a : " , a) ;
  let k  = a.split(',');
  console.log("it's k " , k) ;
  return k ;
}


const Todo: FC = () => {
  gettodolist() ;

  return (
    <div className="todo_section">
      <header>
        Textury Todo App
        <h6 className="todo_section_log_name">you are login</h6>
      </header>
      <div className="inputField">
        <input className="input_data" type="text" placeholder="Add your new todo" />
        <button onClick={()=>{submittodo()}}>
          <AddCircleIcon
            className="todo_section_add_todo"
            style={{ fontSize: 30 }}
          ></AddCircleIcon>
        </button>
      </div>
      <ul className="todoList">
      {
        getLS().length > 0 ? getLS().map(element=> (
          (<li key={element}> {element.toString()}  </li>)
        )) : (
          <></>
        )
        }
      </ul>
      <div className="footer">
      <button onClick={(e)=>{
          gettodolist() ;
          window.location.reload() ;
        }} > refresh </button>
      <button onClick={(e)=>{
          logout(e) ;
        }} > log out </button>
      </div>
    </div>
  );
};














function createwallet(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
 
  async function create() {
    let key = await arweave.wallets.generate();
   
    localStorage.setItem("key", JSON.stringify(key));
    localStorage.setItem("keyexist", "1");
  }
  create();
}





const download = (content: BlobPart, name: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
};

const OnDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  console.log("Download key");
  const Key = localStorage.getItem("key");
  download(JSON.stringify(Key), "Key.json", "text/plain");
};




const getKeyByUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const reader = new FileReader();
 
  reader.readAsText(e.target.files[0]);
  reader.onload = handleFileLoad;
  function handleFileLoad(event:any) {
    console.log(JSON.parse(event.target.result));
    localStorage.setItem("keyexist", "1");
    localStorage.setItem("key", JSON.parse(event.target.result));
    window.location.reload();
  }
};




const Login: FC = () => {
  /********************************************************** */
  return (
    <div className="login_section">
      <div className="login_section_container">
        <div className="login_section_container_tabs">
          <ul>
            <li
              className="sign_in_li active"
              onClick={(e) => {
                tosgnup(e);
              }}
          >
              Sign in
            </li>
            <li
              className="sign_up_li"
              onClick={(e) => {
                tosgnin(e);
              }}
              >
              Sign up
            </li>
          </ul>
        </div>
        <div className="sign_in ">
          <div className="input_field">
            <div className="btn">
              <a
               onClick={(e) => {
                createwallet(e);
              }}
              >
                Generate my account
              </a>
            </div>
          </div>
          <div className="btn">
            <a
            onClick={(e) => {
              OnDownload(e);
            }}
            >
              Download key
            </a>
          </div>
        </div>
        <div className="sign_up disp_none">
          <div className="upload-btn-wrapper">
            <button className="upload-btn">Upload a Key</button>
            <input
              type="file"
              name="myfile"
              onChange={(e) => {
                getKeyByUpload(e);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};






const LoginRouter = () => {
  return (
    <>
      { parseInt(localStorage.getItem("keyexist") || '{}') ? (
        <Todo></Todo>
      ) : (
        <Login></Login>
      )}
    </>
  );
};


export default LoginRouter;