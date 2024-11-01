import { useState, ChangeEvent, FormEvent } from "react";
import "./newProduct.css";
import { addProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";
import React from "react";

interface Inputs {
  [key: string]: any;
}

export default function NewProduct() {
  const [inputs, setInputs] = useState<Inputs>({});
  const [file, setFile] = useState<File | null>(null);
  const [cat, setCat] = useState<string[]>([]);
  const dispatch = useDispatch();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCat = (e: ChangeEvent<HTMLInputElement>) => {
    setCat(e.target.value.split(","));
  };

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "xnradqh7"); // Reemplaza con tu upload preset

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/djovvsorv/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        const downloadURL = data.secure_url;

        const product = {
          _id: "temp_id",
          title: inputs.title || "",
          desc: inputs.desc || "",
          size: inputs.size || [],
          color: inputs.color || [],
          price: Number(inputs.price) || 0,
          inStock: inputs.stock === "Yes",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          img: downloadURL,
          categories: cat,
        };

        addProduct(product, dispatch);
      } catch (error) {
        console.error("Error al subir a Cloudinary", error);
      }
    }
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Product</h1>
      <form className="addProductForm">
        <div className="addProductItem">
          <label>Image</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input
            name="title"
            type="text"
            placeholder="Apple Airpods"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input
            name="desc"
            type="text"
            placeholder="description..."
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Price</label>
          <input
            name="price"
            type="number"
            placeholder="100"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Categories</label>
          <input type="text" placeholder="jeans,skirts" onChange={handleCat} />
        </div>
        <div className="addProductItem">
          <label>Stock</label>
          <select name="inStock" onChange={handleChange}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button onClick={handleClick} className="addProductButton">
          Create
        </button>
      </form>
    </div>
  );
}
