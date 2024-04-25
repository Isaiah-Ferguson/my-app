"use client";

import { Button,Label,TextInput,Modal,FileInput,Dropdown,Accordion,ListGroup,} from "flowbite-react";
import React, { useEffect, useState } from "react";
//the @ when pathing through our folder structure represents our root folder
import { IBlogItems, ICloudImage } from "@/Interfaces/Interfaces";
import NavbarComponent from "../components/NavbarComponent";
import { addBlogItem, checkToken, getBlogItemsByUserId, loggedinData, updateBlogItem } from "@/utils/Dataservices";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

//User's Dashboard page with their Published and unpublished Blog entries, We will also add / Edit blog Entries
const Dashboard = () => {
  const [openModal, setOpenModal] = useState(false);
  const [blogItems, setBlogItems] = useState<IBlogItems[]>();
  //Forms
  // Description, tags, categories, title, and Image
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [categories, setCategories] = useState<string>("");
  const [image, setImage] = useState<any>("");
  const [blogUserId, setBlogUserId] = useState<number>(0);
  const [publisherName, setPublisherName] = useState<string>("");
  const [blogId, setBlogId] = useState<number>(0);

  //Booleans
  const [editBool, setEditBool] = useState<boolean>(true);

  //useRouter should be from next/navigation
  let router = useRouter()

  // This useEffect will grab the user's information as well as their blog info,
  //Will perform a check if user is logged in if not it will take them to the login page
  useEffect(() => {

    //Async function because we are calling getBlogItemsById Fetch
    const getLoggedInData = async () => {
      //Storing our user info in a variable
      const loggedIn = loggedinData();
      let userBlogItems: IBlogItems[] = await getBlogItemsByUserId(loggedIn.userId);
      let filteredBlogItems = userBlogItems.filter(item => item.isDeleted === false);
      //Setting our user info / Fetched data inside of our State Variables
      setBlogUserId(loggedIn.userId);
      setPublisherName(loggedIn.publisherName);
      setBlogItems(filteredBlogItems);
    }


    // Checks if We have a token in local storage if so get user info else go back to login
    if(checkToken()){
        getLoggedInData()
    }else{
    router.push('/');
    }
  }, [])


  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {

    let item: IBlogItems = {
      id: blogId,
      userID: blogUserId,
      publishedName: publisherName,
      description: description,
      date: new Date().toString(),
      title: title,
      image: image,
      tags: tags,
      categories: categories,
      isPublished: e.currentTarget.textContent === "Save and Publish" ? true : false,
      isDeleted: false
    }

    let result = false

      //If edit bool is true we are updating our blog item
      //If it is false we should be adding a new blog item
    if(editBool){
      result = await updateBlogItem(item);
    }else{
      result = await addBlogItem(item);
    }
      //if our blogs updated / add we will call our blog items again from our api
    if(result){
      let userBlogItems: IBlogItems[] = await getBlogItemsByUserId(blogUserId);
      let filteredBlogItems = userBlogItems.filter(item => item.isDeleted === false);
      setBlogItems(filteredBlogItems)
    }

    setOpenModal(false);
  }

  const handleShow = () => {
    setOpenModal(true);
    setEditBool(false);
    setCategories("");
    setTitle("");
    setTags("");
    setDescription("");
    setImage("");
  };

  const handlePublish = async (items: IBlogItems) => {
    items.isPublished = !items.isPublished
    let result = await updateBlogItem(items);

    if(result){
      const loggedIn = loggedinData();
      let userBlogItems: IBlogItems[] = await getBlogItemsByUserId(loggedIn.userId);
      let filterdBlogItems = userBlogItems.filter(item => item.isDeleted === false);
      setBlogItems(filterdBlogItems);
    }
  };

  const handleEdit = (items: IBlogItems) => {
    setEditBool(true);
    setOpenModal(true);
    setBlogId(items.id);
    setPublisherName(items.publishedName)
    setCategories(items.categories);
    setTitle(items.title);
    setTags(items.tags);
    setDescription(items.description);
    setImage(items.image);

  }

  const handleDelete = async (items: IBlogItems) => {
    items.isDeleted = !items.isDeleted;
    let result = await updateBlogItem(items);

    if(result){
      const loggedIn = loggedinData();
      let userBlogItems: IBlogItems[] = await getBlogItemsByUserId(loggedIn.userId);
      let filterdBlogItems = userBlogItems.filter(item => item.isDeleted === false);
      setBlogItems(filterdBlogItems);
    }
  }

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDescription(e.target.value);
  const handleTags = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTags(e.target.value);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    // Send the file data to your Next.js API route
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      if (data.success) {
        console.log("success", data.url);
        setImage(data.url); // Update image state with uploaded image URL
      } else {
        console.error("upload error:", data.error);
        // Display error message to user
      }
    } catch (error) {
      console.error("error:", error);
      // Handle other errors
    }
  };
//   const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let reader = new FileReader();
//     const file = e.target.files?.[0];
//     if (file) {
//       reader.onload = () => {
//         cloudinary.uploader.upload((file), {
//           resource_type: "image",
//         })
//         .then((result: any) => {
//           console.log("success", JSON.stringify(result, null, 2));
//         }).catch((error: any) => {
//           console.log("error", JSON.stringify(error, null, 2));
//         })
//         setImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

  return (
    <>
      <NavbarComponent/>
    <div className="flex min-h-screen flex-col p-24">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl">This is dashboard</h1>
        <Button onClick={handleShow}>Add Blog Item</Button>
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>{editBool ? "Edit" : "Add"} Blog Item</Modal.Header>
          <Modal.Body>
            <form className="flex max-w-md flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Title" value="Title" />
                </div>
                <TextInput
                  onChange={handleTitle}
                  id="Title"
                  type="text"
                  placeholder="Enter Title"
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Description" value="Description" />
                </div>
                <TextInput
                  onChange={handleDescription}
                  id="Description"
                  type="text"
                  placeholder="Enter Description"
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="Tags" value="Tags" />
                </div>
                <TextInput
                  onChange={handleTags}
                  id="Tags"
                  type="text"
                  placeholder="Enter Tags"
                  required
                />
              </div>
              <div>
                {/* <FileInput
                  onChange={handleImage}
                  accept="image/png, image/jpg"
                  id="Picture"
                  placeholder="Choose Image"
                  required
                /> */}

              </div>
              <div className="flex items-center gap-2">
                <Dropdown label="Dropdown button" dismissOnClick={true}>
                  <Dropdown.Item onClick={() => setCategories("Sports")}>
                    Sports
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setCategories("Martial Arts")}>
                    Martial Arts
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setCategories("Fitness")}>
                    Fitness
                  </Dropdown.Item>
                </Dropdown>
              </div>
            </form>
            <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
                    onSuccess={
                        (uploadResponse) => {
                    const imageUrl: ICloudImage = uploadResponse as ICloudImage;
                    setImage(imageUrl.info.url)
                            // You can use the imageUrl for further processing or display
                        }
                    }>
                        {({ open }) => {
                            return (
                            <Button onClick={() => open()}>
                                Upload Picture
                            </Button>
                            );
                        }}
                    </CldUploadWidget>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSave}>Save and Publish</Button>
            <Button color="gray" onClick={handleSave}>
              Save
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <Accordion alwaysOpen>
          <Accordion.Panel>
            <Accordion.Title>Published Blog Items</Accordion.Title>
            <Accordion.Content>
              <ListGroup className="w-484">
                {blogItems && blogItems.map((item, idx) => {
                  return (
                    <div key={idx}>
                      {item.isPublished && (
                        <div className="flex flex-col p-10">
                          <h1 className="text-2xl">{item.title}</h1>
                          <div className="flex flex-row space-x-3">
                            <Button color="blue" onClick={() => handleEdit(item)}>Edit</Button>
                            <Button color="yellow" onClick={()=> handlePublish(item)}>Unpublish</Button>
                            <Button color="red" onClick={() => handleDelete(item)}>Delete</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ListGroup>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>Unpublished Blog Items</Accordion.Title>
            <Accordion.Content>
              <ListGroup className="w-484">
                {blogItems && blogItems.map((item, idx) => {
                  return (
                    <div key={idx}>
                      {!item.isPublished && (
                        <div className="flex flex-col p-10">
                          <h1 className="text-2xl">{item.title}</h1>
                          <div className="flex flex-row space-x-3">
                            <Button color="blue" onClick={() => handleEdit(item)}>Edit</Button>
                            <Button color="yellow" onClick={() =>handlePublish(item)}>Publish</Button>
                            <Button color="red" onClick={() => handleDelete(item)}>Delete</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ListGroup>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
