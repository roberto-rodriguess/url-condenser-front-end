const API = "http://localhost:8080";



async function createUrl(){


    const input = document.getElementById("urlInput");


    const url = input.value;



    if(!url){

        alert("Digite uma URL");

        return;

    }



    const response = await fetch(
        `${API}/api/urls`,
        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                originalUrl:url

            })

        }

    );



    const data = await response.json();



    document.getElementById("result").innerHTML = `

        <p>
        Sua URL curta:
        </p>

        <a href="${data.shortUrl}" target="_blank">
        ${data.shortUrl}
        </a>


        <button class="copy"
        onclick="copyUrl('${data.shortUrl}')">
        Copiar
        </button>

    `;


    input.value="";


    loadUrls();


}




async function loadUrls(){


    const response = await fetch(
        `${API}/api/urls`
    );


    const urls = await response.json();



    const table =
    document.getElementById("urlTable");



    table.innerHTML="";



    urls.forEach(url => {



        table.innerHTML += `


        <tr>


        <td>

        <a href="${url.originalUrl}" target="_blank">

        ${url.originalUrl}

        </a>

        </td>



        <td>

        <a href="${API}/${url.shortCode}" target="_blank">

        ${url.shortCode}

        </a>


        </td>



        <td>

        ${url.clicks}

        </td>



        <td>


        <button 
        class="copy"
        onclick="copyUrl('${API}/${url.shortCode}')">

        Copiar

        </button>


        <button
        class="delete"
        onclick="deleteUrl(${url.id})">

        Excluir

        </button>



        </td>


        </tr>


        `;



    });



}




async function deleteUrl(id){


    await fetch(

        `${API}/api/urls/${id}`,

        {

            method:"DELETE"

        }

    );


    loadUrls();


}




function copyUrl(url){


    navigator.clipboard.writeText(url);


    alert(
        "URL copiada!"
    );


}





loadUrls();