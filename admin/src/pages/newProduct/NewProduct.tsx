import { useState, ChangeEvent, FormEvent } from "react";
import "./newProduct.css";
import { addProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";
import Compressor from "compressorjs";
import { useNavigate } from "react-router-dom";

interface Inputs {
  [key: string]: any;
}

interface ColorImagePair {
  color: string;
  imageFile: File | null;
}

export default function NewProduct() {
  const [inputs, setInputs] = useState<Inputs>({});
  const [file, setFile] = useState<File | null>(null);
  const [cat, setCat] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<ColorImagePair[]>([]); // Estado para color-imagen
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      const signatureResponse = await fetch(
        "http://localhost:5000/generate-signature"
      );
      const { signature, timestamp, api_key, cloud_name } =
        await signatureResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("format", "png");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error al subir a Cloudinary", error);
      throw error;
    }
  };

  const handleFileUpload = (file: File): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        mimeType: "image/png",
        convertSize: Infinity,
        success(compressedFile) {
          resolve(compressedFile as File);
        },
        error(err) {
          console.error("Error al comprimir la imagen:", err.message);
          reject(err);
        },
      });
    });
  };

  const addColorImagePair = () => {
    if (!inputs.color || !file) {
      alert("Por favor selecciona un color e imagen.");
      return;
    }
    setColorImages([...colorImages, { color: inputs.color, imageFile: file }]);
    setFile(null);
    setInputs((prev) => ({ ...prev, color: "" }));
  };

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();

    const imageMap: { [key: string]: string } = {};

    // Subir todas las imágenes de color y agregarlas al mapa
    for (const { color, imageFile } of colorImages) {
      if (imageFile) {
        const compressedFile = await handleFileUpload(imageFile);
        const imageUrl = await uploadToCloudinary(compressedFile);
        imageMap[color] = imageUrl;
      }
    }

    // Selecciona la primera imagen en imageMap como imagen principal
    const firstImageUrl = Object.values(imageMap)[0];

    if (firstImageUrl) {
      try {
        const product = {
          title: inputs.title || "",
          desc: inputs.desc || "",
          size: inputs.size || [],
          colors: Object.keys(imageMap), // Lista de colores según el mapa
          price: Number(inputs.price) || 0,
          inStock: inputs.inStock === "true",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: imageMap, // Mapa de colores a URLs de imágenes
          img: firstImageUrl, // Primera imagen como imagen principal
          categories: cat,
        };

        console.log("Producto que se va a enviar:", product); // Log para verificar el contenido del objeto `product`

        await addProduct(product, dispatch);
        alert("Producto agregado exitosamente");
        //navigate("/"); // Redirigir a otra página después de agregar
      } catch (error) {
        console.error("Error al manejar el archivo", error);
      }
    } else {
      console.error("No hay imágenes para establecer como principal");
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
          <label>Color</label>
          <input
            name="color"
            type="text"
            placeholder="e.g., rojo"
            onChange={handleChange}
          />
        </div>
        <button type="button" onClick={addColorImagePair}>
          Añadir Color e Imagen
        </button>
        <div className="addProductItem">
          <label>Title</label>
          <input
            name="title"
            type="text"
            placeholder="Nombre del producto"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input
            name="desc"
            type="text"
            placeholder="Descripción..."
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Price</label>
          <input
            name="price"
            type="number"
            placeholder="Precio"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Categories</label>
          <input type="text" placeholder="Categorías" onChange={handleCat} />
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
      <div>
        <h3>Colores e Imágenes Agregados:</h3>
        {colorImages.map((ci, index) => (
          <p key={index}>
            Color: {ci.color} - Imagen: {ci.imageFile?.name || "No image"}
          </p>
        ))}
      </div>
    </div>
  );
}
