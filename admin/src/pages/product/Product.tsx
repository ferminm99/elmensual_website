import React, {
  useEffect,
  useMemo,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import "./product.css";
import Chart from "../../components/chart/Chart";
import { Publish, Delete } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { userRequest } from "../../requestMethods";
// @ts-ignore
import Compressor from "compressorjs";
import { updateProduct } from "../../redux/apiCalls";
import { useDrag, useDrop } from "react-dnd";

interface ProductState {
  product: {
    products: {
      _id: string;
      title: string;
      img: string;
      inStock: boolean;
      desc: string;
      price: number;
      categories: string[];
      size: number[];
      colors: string[];
      createdAt: string;
      images: { [key: string]: string };
    }[];
  };
}

// Subcomponente para cada imagen
const DraggableImage: React.FC<{
  image: { color: string; url: string };
  index: number;
  moveImage: (fromIndex: number, toIndex: number) => void;
  handleDeleteImage: (color: string) => void;
}> = ({ image, index, moveImage, handleDeleteImage }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [, drag] = useDrag({
    type: "image",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "image",
    hover: (draggedItem: { index: number }) => {
      if (!ref.current) return;

      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index; // Actualizamos el índice del elemento arrastrado
      }
    },
  });

  drag(drop(ref));

  return (
    <div ref={ref} className="productImageContainer">
      <img src={image.url} alt={image.color} className="productImage" />
      <div className="imageLabel">{image.color}</div>
      <Delete
        className="deleteIcon"
        onClick={() => handleDeleteImage(image.color)}
        titleAccess="Eliminar imagen"
      />
    </div>
  );
};

// Componente para manejar las imágenes actuales
const ProductImages: React.FC<{
  images: { color: string; url: string }[];
  setImages: (updatedImages: { color: string; url: string }[]) => void;
  handleDeleteImage: (color: string) => void;
}> = ({ images, setImages, handleDeleteImage }) => {
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);

    setImages(updatedImages);
  };

  return (
    <div className="productImages">
      {images.map((image, index) => (
        <DraggableImage
          key={image.color}
          index={index}
          image={image}
          moveImage={moveImage}
          handleDeleteImage={handleDeleteImage}
        />
      ))}
    </div>
  );
};

const Product: React.FC = () => {
  const location = useLocation();
  const productId = location.pathname.split("/")[2];
  const [pStats, setPStats] = useState<{ name: string; Sales: number }[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [inStock, setInStock] = useState("true");
  const [categories, setCategories] = useState<string>(""); // Para editar en un solo input
  const [sizes, setSizes] = useState<number[]>([]);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [colorImages, setColorImages] = useState<{ [key: string]: string }>({});
  const [newColor, setNewColor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<
    { color: string; url: string; productName: string }[]
  >([]);
  const [selectedExistingImage, setSelectedExistingImage] = useState<{
    color: string;
    url: string;
    productName: string;
  } | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductForImages, setSelectedProductForImages] = useState("");

  const dispatch = useDispatch();

  const product = useSelector((state: ProductState) =>
    state.product.products.find((product) => product._id === productId)
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await userRequest.get("/products");
        setAllProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDesc(product.desc);
      setPrice(product.price);
      setInStock(product.inStock ? "true" : "false");
      setCategories(product.categories.join(", "));
      setSizes(product.size.map((size) => Number(size))); // Convertir a número
      setColorImages(product.images);
    }
  }, [product]);

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const res = await userRequest.get("/products"); // Asegúrate de que la URL sea correcta
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

  const MONTHS = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    []
  );

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await userRequest.get(`orders/income?pid=${productId}`);
        const list = res.data.sort((a: any, b: any) => a._id - b._id);
        setPStats(
          list.map((item: any) => ({
            name: MONTHS[item._id - 1],
            Sales: item.total,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    getStats();
  }, [productId, MONTHS]);

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
    const commonSizes = Array.from({ length: 10 }, (_, i) => 36 + i * 2); // Solo del 36 al 54
    setSizes((prevSizes) => [
      ...new Set([...prevSizes, ...commonSizes]), // Eliminar duplicados
    ]);
  };

  const handleSelectProductForImages = () => {
    if (!selectedProductForImages) {
      alert("Por favor, selecciona un producto.");
      return;
    }

    // Encuentra el producto seleccionado
    const selectedProduct = allProducts.find(
      (prod) => prod._id === selectedProductForImages
    );

    if (selectedProduct && selectedProduct.images) {
      setColorImages((prevImages) => ({
        ...prevImages,
        ...selectedProduct.images, // Agrega las imágenes del producto seleccionado
      }));
      alert("Imágenes copiadas exitosamente.");
    }
  };

  const handleColorChange = async () => {
    if (!newColor) {
      alert("Por favor, ingresa un nombre de color.");
      return;
    }

    // Validar si el color ya existe
    if (colorImages[newColor]) {
      alert("El color ya existe. Por favor, elige otro nombre.");
      return;
    }

    if (file || selectedExistingImage) {
      let imageUrl: string;

      if (selectedExistingImage) {
        // Usar imagen existente seleccionada
        imageUrl = selectedExistingImage.url;
      } else if (file) {
        try {
          const compressedBlob = await new Promise<Blob>((resolve, reject) => {
            new Compressor(file, {
              quality: 0.8,
              maxWidth: 1000,
              maxHeight: 1000,
              mimeType: "image/png", // Asegura que sea PNG
              convertSize: Infinity, // Evita convertir archivos pequeños a JPEG
              success(compressedBlob: Blob | PromiseLike<Blob>) {
                resolve(compressedBlob);
              },
              error(err: any) {
                reject(err);
              },
            });
          });

          // Convertir el Blob a un File
          const compressedFile = new File([compressedBlob], file.name, {
            type: "image/png",
            lastModified: Date.now(),
          });

          const formData = new FormData();
          formData.append("file", compressedFile);

          // Subir archivo a Cloudinary
          imageUrl = await uploadToCloudinary(formData);
        } catch (error) {
          console.error("Error al comprimir/subir la imagen:", error);
          alert("Hubo un problema al subir la imagen. Intenta de nuevo.");
          return;
        }
      } else {
        alert("Selecciona una imagen antes de continuar.");
        return;
      }

      setColorImages((prevImages) => ({
        ...prevImages,
        [newColor]: imageUrl,
      }));
      setFile(null);
      setNewColor("");
      setSelectedExistingImage(null);
      alert("Imagen añadida con éxito.");
    }
  };

  const uploadToCloudinary = async (formData: FormData): Promise<string> => {
    try {
      const signatureResponse = await fetch(
        "http://localhost:5000/generate-signature"
      );
      const { signature, timestamp, api_key, cloud_name } =
        await signatureResponse.json();

      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("format", "png"); // Asegurarse de que se guarde como PNG

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

  const handleDeleteImage = (color: string) => {
    setColorImages((prevImages) => {
      const newImages = { ...prevImages };
      delete newImages[color];
      return newImages;
    });
  };

  const handleSetPrimaryImage = (url: string) => {
    if (product) {
      product.img = url; // Actualizamos la imagen principal
      alert("Imagen principal actualizada correctamente."); // Mensaje de éxito
    }

    setColorImages((prevImages) => ({
      ...prevImages,
    }));
  };

  const handleCategoriesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategories(e.target.value);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;

    // Eliminar duplicados en el array de talles, manteniéndolos como strings
    const uniqueSizes = Array.from(new Set(sizes.map(String)));

    const updatedProduct = {
      _id: product._id,
      title,
      desc,
      price: Number(price),
      inStock: inStock === "true",
      categories: categories.split(",").map((cat) => cat.trim()),
      size: uniqueSizes, // Utilizar los talles sin duplicados y como strings
      images: colorImages,
      img: colorImages[Object.keys(colorImages)[0]] || product.img,
      colors: product.colors || [],
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Producto actualizado:", updatedProduct);
    await updateProduct(productId, updatedProduct, dispatch);
  };

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product</h1>
        <RouterLink to="/newproduct">
          <button className="productAddButton">Create</button>
        </RouterLink>
      </div>
      <div className="productTop">
        <div className="productTopLeft">
          <Chart data={pStats} title="Sales Performance" grid dataKey="Sales" />
        </div>
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={product?.img} alt="" className="productInfoImg" />
            <span className="productName">{product?.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{product?._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">sales:</span>
              <span className="productInfoValue">5123</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">in stock:</span>
              <span className="productInfoValue">
                {product?.inStock ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm" onSubmit={handleUpdate}>
          <div className="productFormLeft">
            <label>Product Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label>Product Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <label>In Stock</label>
            <select
              value={inStock}
              onChange={(e) => setInStock(e.target.value)}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <label>Categories</label>
            <input
              type="text"
              value={categories}
              placeholder="Categorías separadas por coma"
              onChange={handleCategoriesChange}
            />
            <label>Sizes</label>
            <div
              className="dropdown"
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            >
              Seleccionar Talles
            </div>
            {showSizeDropdown && (
              <div className="dropdown-content">
                <button type="button" onClick={handleSelectCommonSizes}>
                  Seleccionar 36 a 54
                </button>
                {Array.from({ length: 36 }, (_, i) => i * 2).map((size) => (
                  <div key={size}>
                    {(size >= 0 && size <= 16) || (size >= 32 && size <= 70) ? (
                      <>
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={sizes.includes(size)}
                          onChange={() => handleSizeChange(size)}
                        />
                        <label htmlFor={`size-${size}`}>{size}</label>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            <label>Seleccionar Producto para Copiar Imágenes</label>
            <select
              value={selectedProductForImages}
              onChange={(e) => setSelectedProductForImages(e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {allProducts.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSelectProductForImages}
              className="productButton"
            >
              Copiar Imágenes del Producto
            </button>

            <label>Elegir Imagen Existente</label>
            <select
              onChange={handleExistingImageSelect}
              value={selectedExistingImage?.url || ""}
            >
              <option value="">Selecciona una imagen</option>
              {existingImages.map((image, index) => (
                <option key={index} value={image.url}>
                  {image.productName} - {image.color}
                </option>
              ))}
            </select>

            <label>Color and Image</label>
            <input
              type="text"
              placeholder="Color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            />
            <input
              type="file"
              accept="image/png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <button type="button" onClick={handleColorChange}>
              Add Color Image
            </button>
          </div>
          <div className="productFormRight">
            <div className="productUpload">
              <img src={product?.img} alt="" className="productUploadImg" />
              <label htmlFor="file">
                <Publish />
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <button
              type="button"
              onClick={() => setColorImages({})}
              className="productButton"
            >
              Eliminar todas las imágenes
            </button>

            <ProductImages
              images={Object.entries(colorImages).map(([color, url]) => ({
                color,
                url,
              }))}
              setImages={(updatedImages) => {
                const newColorImages: { [key: string]: string } = {};
                updatedImages.forEach(({ color, url }) => {
                  newColorImages[color] = url;
                });
                setColorImages(newColorImages);
              }}
              handleDeleteImage={handleDeleteImage}
            />

            <button type="submit" className="productButton">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Product;
