let yourCollection = {};

//save the session storage to your collection
Object.keys(sessionStorage).forEach((key) => {
    yourCollection[key] = sessionStorage.getItem(key);
});

//create a function for sorting by name
function sortByName(objArr){
    objArr.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        return 0;
    })
}

//get the profile results div
let profileResults = document.querySelector(".profile-results")

//////Import a file

//get the file input
let fileInput = document.querySelector(".user-file")

fileInput.onchange = (event) => {
    let userFile = event.target.files[0];

    //make sure its a text file
    if (userFile.type !== "text/plain") {
        //send wrong file tpye message and remove the file
        window.alert("Please submit a valid text file");
        fileInput.value = "";
    } else {
        //create a file reader
        const reader = new FileReader();
        reader.readAsText(userFile, "UTC-8");
        //tell the file reader what to do once it loads
        reader.onload = (readEvent) => {
            //get the json from the text file and assign it to my collection
            importedCollection = JSON.parse(readEvent.target.result);

            Object.keys(importedCollection).forEach((key) => {
                //save the keys from the imported collection to the your collection and session storage
                yourCollection[key] = importedCollection[key];
                sessionStorage[key] = importedCollection[key];
            });

        }
    }
}

//////Export a file

//get the download link
const downloadLink = document.querySelector(".download-file");

//put the content inside the file, as a string
const collectionFile = new Blob([JSON.stringify(yourCollection)], { type: "text/plain" });

//add the file
downloadLink.href = URL.createObjectURL(collectionFile);

//set the name of the file
downloadLink.download = "collection.txt";


document.querySelector(".profile-search").addEventListener("submit", async (event) => {
    event.preventDefault();

    //get the value of the dropdown box
    let itemChosen = event.target.item.value;

    //clear the inner hrml of the results div
    profileResults.innerHTML = "";

    //if amiibos is chosen
    if (itemChosen === "amiibos") {

        //fetch the amiibo api
        await fetch("https://amiiboapi.com/api/amiibo/")
            .then(res => res.json())
            .then((res) => {

                //create an array for the results that we can sort later
                let amiiboCollection = [];

                //go through each amiibo in the api
                res.amiibo.forEach((amiibo) => {
                    //get the amiibos head and tail as the same format as your collections keys
                    let key = `AMIIBO-${amiibo.head}${amiibo.tail}`

                    //check if you have the amiibo in your collection
                    if (yourCollection[key]) {

                        //create quantity variable
                        let quantityValue = yourCollection[key];

                        //push the amiibo into the array made earlier
                        amiiboCollection.push(amiibo);

                        //set the quantity key for each amiibo
                        amiiboCollection[amiiboCollection.length - 1].quantity = quantityValue;

                    }



                })

                //check if the collection has any results
                if (amiiboCollection.length === 0) {
                    //create message saying empty collection
                    const message = document.createElement("p")
                    message.textContent = "Your Amiibo collection is currently empty. Please import a file or search for Amiibos "
                    //create a link to the amiibos search page
                    const here = document.createElement("a")
                    here.href = "./amiibos.html"
                    here.textContent = "here."
                    message.append(here);
                    profileResults.append(message);

                } else {

                    //check if sorting by name or quantity
                    const sortBy = event.target.sort.value;

                    switch (sortBy){
                        case "name":
                            //sort by name
                            sortByName(amiiboCollection);
                            break;

                        case "quant":
                            //sort by name then quantity
                            sortByName(amiiboCollection);

                            amiiboCollection.sort((a, b) => {
                                return b.quantity - a.quantity;
                            })
                            break;
                    }

                    //loop through the new array
                    amiiboCollection.forEach((amiibo) => {
                        //create the element cards for the result page
                        let profileArticle = document.createElement("article");

                        //create the image
                        let picture = document.createElement("img")
                        picture.src = amiibo.image;
                        picture.alt = amiibo.name;
                        picture.title = amiibo.name;
                        
                        profileArticle.append(picture);

                        //create a quantity p tag
                        let quantityMessage = document.createElement("label")
                        quantityMessage.textContent = `Quantity: ${amiibo.quantity}`
                        profileArticle.append(quantityMessage);

                        //create a hidden p tag with the amiibos name, shown at print only
                        let printName = document.createElement("label");
                        printName.className = "print-only"
                        printName.textContent = amiibo.name;
                        profileArticle.append(printName);

                        //create the remove item button
                        let removeButton = document.createElement("button");
                        removeButton.innerText = "Remove"
                        profileArticle.append(removeButton);

                        profileResults.append(profileArticle);

                        removeButton.addEventListener("click", () => {
                            //delete the key value pair from storage and your collection
                            delete sessionStorage[`AMIIBO-${amiibo.head}${amiibo.tail}`];

                            delete yourCollection[`AMIIBO-${amiibo.head}${amiibo.tail}`];

                            //remove the whole article
                            profileArticle.remove()   
                                                })

                    })

                }

                //////Pages

                const profileArticleArr = profileResults.querySelectorAll("article");

                //call the pages function
                pages(current, profileArticleArr, amiiboPerPageLimit);

            })

            .catch((err) => {
                console.log(err);
            })

    }
})








