import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./newProduct.css";
import { addProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";
// @ts-ignore
import Compressor from "compressorjs";
import { useNavigate } from "react-router-dom";
import { publicRequest } from "../../requestMethods";

interface Inputs {
  [key: string]: any;
}

interface ColorImagePair {
  color: string;
  imageFile: File | null;
  imageUrl?: string; // Agregar imageUrl como opcional
}

export default function NewProduct() {
  const [inputs, setInputs] = useState<Inputs>({});
  const [file, setFile] = useState<File | null>(null);
  const [cat, setCat] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<ColorImagePair[]>([]); // Estado para color-imagen
  const [sizes, setSizes] = useState<number[]>([]);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [inStock, setInStock] = useState("true");
  const [existingImages, setExistingImages] = useState<
    { color: string; url: string; productName: string }[]
  >([]);
  const [selectedExistingImage, setSelectedExistingImage] = useState<{
    color: string;
    url: string;
    productName: string;
  } | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const res = await publicRequest.get("/products"); // Asegúrate de que esta URL sea la correcta
        const images = res.data.flatMap((product: any) =>
          Object.entries(product.images).map(([color, url]) => ({
            color: color.replace(/\d+/g, ""), // Remueve los números
            url,
            productName: product.title,
          }))
        );
        setExistingImages(images);
      } catch (error) {
        console.error("Error al obtener imágenes existentes:", error);
      }
    };
    fetchExistingImages();
  }, []);

  const handleSizeChange = (size: number) => {
    setSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size]
    );
  };

  const handleExistingImageSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedImage = existingImages.find(
      (img) => img.url === event.target.value
    );
    setSelectedExistingImage(selectedImage || null);
  };

  const handleSelectCommonSizes = () => {
    const commonSizes = Array.from(
      { length: (54 - 32) / 2 + 1 },
      (_, i) => 32 + i * 2
    );
    setSizes(commonSizes);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "inStock") {
      setInStock(value); // Actualiza el valor de inStock directamente
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
        success(compressedFile: File) {
          resolve(compressedFile as File);
        },
        error(err: { message: any }) {
          console.error("Error al comprimir la imagen:", err.message);
          reject(err);
        },
      });
    });
  };

  const addColorImagePair = () => {
    if (!inputs.color || (!file && !selectedExistingImage)) {
      alert("Por favor selecciona un color e imagen.");
      return;
    }

    const imageToAdd = selectedExistingImage
      ? {
          color: inputs.color,
          imageFile: null,
          imageUrl: selectedExistingImage.url,
        }
      : { color: inputs.color, imageFile: file };

    setColorImages([...colorImages, imageToAdd]);
    setFile(null);
    setSelectedExistingImage(null);
    setInputs((prev) => ({ ...prev, color: "" }));
  };

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();

    const imageMap: { [key: string]: string } = {};
    for (const { color, imageFile, imageUrl } of colorImages) {
      if (imageUrl) {
        imageMap[color] = imageUrl;
      } else if (imageFile) {
        const compressedFile = await handleFileUpload(imageFile);
        const uploadedUrl = await uploadToCloudinary(compressedFile);
        imageMap[color] = uploadedUrl;
      }
    }

    const firstImageUrl = Object.values(imageMap)[0];
    if (firstImageUrl) {
      try {
        const product = {
          title: inputs.title || "",
          desc: inputs.desc || "",
          size: sizes.map(String), // Asegurarse de que los talles estén como strings
          colors: Object.keys(imageMap),
          price: Number(inputs.price) || 0,
          inStock: inStock === "true", // Asigna el valor booleano según el estado de inStock
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: imageMap,
          img: firstImageUrl,
          categories: cat,
        };

        await addProduct(product, dispatch);
        alert("Producto agregado exitosamente");
        //navigate("/");
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
          <label>Elegir Imagen Existente</label>
          <select onChange={handleExistingImageSelect}>
            <option value="">Selecciona una imagen</option>
            {existingImages.map((image, index) => (
              <option key={index} value={image.url}>
                {image.productName} - {image.color}
              </option>
            ))}
          </select>
        </div>

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
          <label>Talles</label>
          <div
            className="dropdown"
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
          >
            Seleccionar Talles
          </div>
          {showSizeDropdown && (
            <div className="dropdown-content">
              <button type="button" onClick={handleSelectCommonSizes}>
                Seleccionar 32 a 54
              </button>
              {Array.from({ length: 31 }, (_, i) => i * 2).map((size) => (
                <div key={size}>
                  <input
                    type="checkbox"
                    id={`size-${size}`}
                    checked={sizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                  />
                  <label htmlFor={`size-${size}`}>{size}</label>
                </div>
              ))}
            </div>
          )}
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
            Color: {ci.color} - Imagen:
            {ci.imageFile ? (
              ci.imageFile.name
            ) : (
              <img
                src={ci.imageUrl}
                alt={ci.color}
                style={{ width: "50px", height: "50px", marginLeft: "10px" }}
              />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
