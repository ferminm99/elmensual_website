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
import { updateProduct, Variant } from "../../redux/apiCalls";
import { resolveImageUrl } from "../../utils/imageUrl";

// Fuerza 3:4 con recorte inteligente
const toSmart34 = (url: string) => {
  if (!url || !url.includes("/upload/")) return url;
  const [prefix, rest] = url.split("/upload/");
  return `${prefix}/upload/c_fill,ar_3:4,g_auto/${rest}`;
};

const buildStaticPath = (productId: string, key: string) =>
  `/products/${productId}/${key}.webp`;

const normalizeImagePath = (url: string, productId: string, key: string) => {
  if (!url) return url;
  if (url.startsWith("/products/")) return url;
  return buildStaticPath(productId, key);
};

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
      variants?: Variant[];
      totalStock?: number;
      createdAt: string;
      images: { [key: string]: string };
    }[];
  };
}
/* ---------- Item de imagen con input de posición arriba-izquierda ---------- */
const ImageItem: React.FC<{
  image: { color: string; url: string };
  index: number; // índice actual (0-based)
  total: number; // total de imágenes
  moveImage: (fromIndex: number, toIndex: number) => void;
  handleDeleteImage: (color: string) => void;
}> = ({ image, index, total, moveImage, handleDeleteImage }) => {
  const [pos, setPos] = useState(String(index + 1)); // UI 1-based

  useEffect(() => setPos(String(index + 1)), [index]);

  const commitPosition = () => {
    let n = parseInt(pos, 10);
    if (Number.isNaN(n)) return;
    n = Math.max(1, Math.min(total, n)); // clamp 1..total
    if (n - 1 !== index) moveImage(index, n - 1);
  };

  return (
    <div className="productImageContainer" style={{ position: "relative" }}>
      {/* POS INPUT arriba-izquierda */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          zIndex: 2,
          background: "rgba(0,0,0,0.55)",
          padding: "2px 4px",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <input
          type="number"
          min={1}
          max={total}
          value={pos}
          title={`Posición (1-${total})`}
          onChange={(e) => setPos(e.target.value)}
          onBlur={commitPosition}
          onKeyDown={(e) => e.key === "Enter" && commitPosition()}
          style={{
            width: 46,
            padding: "2px 4px",
            border: "1px solid #ddd",
            borderRadius: 4,
            fontSize: 12,
            color: "#111",
            background: "#fff",
          }}
        />
      </div>

      <img
        src={toSmart34(resolveImageUrl(image.url))}
        alt={image.color}
        className="productImage"
      />
      <div className="imageLabel">{image.color}</div>

      <Delete
        className="deleteIcon"
        onClick={() => handleDeleteImage(image.color)}
        titleAccess="Eliminar imagen"
      />
    </div>
  );
};

/* ---------- Contenedor de imágenes (reordenamiento por número) ---------- */
const ProductImages: React.FC<{
  images: { color: string; url: string }[];
  setImages: (updatedImages: { color: string; url: string }[]) => void;
  handleDeleteImage: (color: string) => void;
}> = ({ images, setImages, handleDeleteImage }) => {
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    if (fromIndex === toIndex) return;

    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved); // corre las demás 1 lugar
    setImages(updated);
  };

  return (
    <div className="productImages">
      {images.map((image, index) => (
        <ImageItem
          key={image.color}
          index={index}
          total={images.length}
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
  const [categories, setCategories] = useState<string>("");
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
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantForm, setVariantForm] = useState<Variant>({
    size: "",
    color: "",
    stock: 0,
  });
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );
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
      setSizes(product.size.map((size) => Number(size)));
      const variantSizes = (product.variants || [])
        .map((variant) => Number(variant.size))
        .filter((size) => Number.isFinite(size));
      const sizeList = variantSizes.length
        ? variantSizes
        : product.size.map((size) => Number(size));
      setSizes(sizeList);
      setColorImages(product.images);
      setVariants(product.variants || []);
      setColorImages(product.images);
    }
  }, [product]);

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const res = await userRequest.get("/products");
        const images = res.data.flatMap((product: any) =>
          Object.entries(product.images).map(([color, url]) => ({
            color: color.replace(/\d+/g, ""),
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
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleExistingImageSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedImage = existingImages.find(
      (img) => img.url === event.target.value
    );
    setSelectedExistingImage(selectedImage || null);
  };

  const handleSelectCommonSizes = () => {
    const commonSizes = Array.from({ length: 10 }, (_, i) => 36 + i * 2);
    setSizes((prev) => [...new Set([...prev, ...commonSizes])]);
  };

  const resetVariantForm = () => {
    setVariantForm({ size: "", color: "", stock: 0 });
    setEditingVariantIndex(null);
  };

  const handleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) : value,
    }));
  };

  const handleVariantSubmit = () => {
    const trimmedSize = String(variantForm.size || "").trim();
    const trimmedColor = String(variantForm.color || "").trim();
    const stockValue = Number(variantForm.stock);

    if (!trimmedSize || !trimmedColor) {
      alert("Ingresá talle y color para la variante.");
      return;
    }

    if (Number.isNaN(stockValue) || stockValue < 0) {
      alert("El stock debe ser un número mayor o igual a 0.");
      return;
    }

    const duplicateIndex = variants.findIndex(
      (variant, index) =>
        index !== editingVariantIndex &&
        String(variant.size).trim().toLowerCase() ===
          trimmedSize.toLowerCase() &&
        String(variant.color).trim().toLowerCase() ===
          trimmedColor.toLowerCase()
    );

    if (duplicateIndex !== -1) {
      alert("Ya existe una variante con ese talle y color.");
      return;
    }

    const normalizedVariant: Variant = {
      ...variants[editingVariantIndex ?? variants.length],
      size: trimmedSize,
      color: trimmedColor,
      stock: stockValue,
    };

    if (editingVariantIndex !== null) {
      setVariants((prev) =>
        prev.map((variant, index) =>
          index === editingVariantIndex ? normalizedVariant : variant
        )
      );
    } else {
      setVariants((prev) => [...prev, normalizedVariant]);
    }

    const parsedSize = Number(trimmedSize);
    if (Number.isFinite(parsedSize)) {
      setSizes((prev) => Array.from(new Set([...prev, parsedSize])));
    }
    resetVariantForm();
  };

  const handleVariantEdit = (index: number) => {
    const variant = variants[index];
    setVariantForm({
      size: variant.size || "",
      color: variant.color || "",
      stock: variant.stock || 0,
      _id: variant._id,
    });
    setEditingVariantIndex(index);
  };

  const handleVariantDelete = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    if (editingVariantIndex === index) {
      resetVariantForm();
    }
  };

  const handleSelectProductForImages = () => {
    if (!selectedProductForImages) {
      alert("Por favor, selecciona un producto.");
      return;
    }
    const selectedProduct = allProducts.find(
      (prod) => prod._id === selectedProductForImages
    );
    if (selectedProduct && selectedProduct.images) {
      const normalized = Object.fromEntries(
        Object.entries(selectedProduct.images).map(([color, url]) => [
          color,
          toSmart34(url as string),
        ])
      );
      setColorImages((prev) => ({ ...prev, ...normalized }));
      alert("Imágenes copiadas exitosamente.");
    }
  };

  const handleColorChange = async () => {
    if (!product) return;
    if (!newColor) {
      alert("Por favor, ingresa un nombre de color.");
      return;
    }
    if (colorImages[newColor]) {
      alert("El color ya existe. Por favor, elige otro nombre.");
      return;
    }

    if (file || selectedExistingImage) {
      let imageUrl: string | undefined;
      if (selectedExistingImage) {
        imageUrl = normalizeImagePath(
          selectedExistingImage.url,
          product._id,
          newColor
        );
      } else if (file) {
        try {
          const compressedBlob = await new Promise<Blob>((resolve, reject) => {
            new Compressor(file, {
              quality: 0.8,
              maxWidth: 1000,
              maxHeight: 1000,
              mimeType: "image/png",
              convertSize: Infinity,
              success(compressedBlob: Blob | PromiseLike<Blob>) {
                resolve(compressedBlob);
              },
              error(err: any) {
                reject(err);
              },
            });
          });

          const compressedFile = new File([compressedBlob], `${newColor}.png`, {
            type: "image/png",
            lastModified: Date.now(),
          });

          imageUrl = await uploadToPublicStorage(
            product._id,
            newColor,
            compressedFile
          );
        } catch (error) {
          console.error("Error al comprimir/subir la imagen:", error);
          alert("Hubo un problema al subir la imagen. Intenta de nuevo.");
          return;
        }
      } else {
        alert("Selecciona una imagen antes de continuar.");
        return;
      }

      setColorImages((prev) => ({ ...prev, [newColor]: imageUrl! }));
      setFile(null);
      setNewColor("");
      setSelectedExistingImage(null);
      alert("Imagen añadida con éxito.");
    }
  };

  const uploadToPublicStorage = async (
    productId: string,
    key: string,
    fileToUpload: File
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("productId", productId);
    formData.append("key", key);

    const response = await userRequest.post(
      "/uploads/product-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data.path as string;
  };

  const handleDeleteImage = (color: string) => {
    setColorImages((prev) => {
      const next = { ...prev };
      delete next[color];
      return next;
    });
  };

  const handleSetPrimaryImage = (url: string) => {
    if (product) {
      product.img = normalizeImagePath(url, product._id, "img");
      alert("Imagen principal actualizada correctamente.");
    }
    setColorImages((prev) => ({ ...prev }));
  };

  const handleCategoriesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategories(e.target.value);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setErrorMessage(null);

    const uniqueSizes = Array.from(new Set(sizes.map(String)));

    const orderedArray = Object.entries(colorImages).map(([color, url]) => ({
      color,
      url,
    })); // el orden de la UI ya lo mantenemos al reconstruir más abajo

    const normalizedImages: { [k: string]: string } = {};
    orderedArray.forEach(({ color, url }) => {
      normalizedImages[color] = normalizeImagePath(url, product._id, color);
    });

    const normalizedVariants: Variant[] = variants.map((variant) => ({
      _id: variant._id,
      size: String(variant.size),
      color: variant.color,
      stock: Math.max(0, Number(variant.stock) || 0),
    }));

    const totalStock = normalizedVariants.reduce(
      (sum, variant) => sum + Number(variant.stock || 0),
      0
    );

    const variantSizes = normalizedVariants
      .map((variant) => String(variant.size).trim())
      .filter(Boolean);
    const variantColors = normalizedVariants
      .map((variant) => variant.color)
      .filter(Boolean) as string[];

    const finalSizes = Array.from(new Set([...variantSizes, ...uniqueSizes]));

    const finalColors = Array.from(
      new Set([...variantColors, ...Object.keys(colorImages)])
    );
    const updatedProduct = {
      _id: product._id,
      title,
      desc,
      price: Number(price),
      inStock: totalStock > 0 ? true : inStock === "true",
      categories: categories.split(",").map((cat) => cat.trim()),
      size: finalSizes,
      images: normalizedImages,
      img:
        normalizedImages[Object.keys(normalizedImages)[0] as any] ||
        normalizeImagePath(product.img, product._id, "img"),
      colors: finalColors,
      variants: normalizedVariants,
      totalStock,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Producto actualizado:", updatedProduct);
    try {
      await updateProduct(productId, updatedProduct as any, dispatch);
    } catch (error: any) {
      setErrorMessage(error.message || "No se pudo actualizar el producto.");
    }
  };

  const totalVariantStock = variants.reduce(
    (sum, variant) => sum + Number(variant.stock || 0),
    0
  );

  // const uploadToCloudinary = async (formData: FormData): Promise<string> => {
  //   try {
  //     const signatureResponse = await fetch(
  //       "http://localhost:5000/generate-signature"
  //     );
  //     const { signature, timestamp, api_key, cloud_name } =
  //       await signatureResponse.json();

  //     formData.append("api_key", api_key);
  //     formData.append("timestamp", timestamp.toString());
  //     formData.append("signature", signature);
  //     formData.append("format", "png");

  //     const response = await fetch(
  //       `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
  //       { method: "POST", body: formData }
  //     );

  //     const data = await response.json();
  //     return toSmart34(data.secure_url);
  //   } catch (error) {
  //     console.error("Error al subir a Cloudinary", error);
  //     throw error;
  //   }
  // };

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
            <img
              src={toSmart34(resolveImageUrl(product?.img || ""))}
              alt=""
              className="productInfoImg"
            />
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
            <div className="productInfoItem">
              <span className="productInfoKey">total stock:</span>
              <span className="productInfoValue">{totalVariantStock}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="productBottom">
        <form className="productForm" onSubmit={handleUpdate}>
          <div className="productFormLeft">
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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

            <label>Variantes</label>
            <div className="variantForm">
              <input
                name="size"
                type="text"
                placeholder="Talle"
                value={variantForm.size}
                onChange={handleVariantChange}
              />
              <input
                name="color"
                type="text"
                placeholder="Color"
                value={variantForm.color}
                onChange={handleVariantChange}
              />
              <input
                name="stock"
                type="number"
                min={0}
                placeholder="Stock"
                value={variantForm.stock}
                onChange={handleVariantChange}
              />
              <button type="button" onClick={handleVariantSubmit}>
                {editingVariantIndex !== null
                  ? "Guardar cambios"
                  : "Agregar variante"}
              </button>
              {editingVariantIndex !== null && (
                <button type="button" onClick={resetVariantForm}>
                  Cancelar edición
                </button>
              )}
            </div>

            <div className="variantList">
              <p>Total de stock: {totalVariantStock}</p>
              {variants.length === 0 && <p>No hay variantes cargadas.</p>}
              {variants.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Talle</th>
                      <th>Color</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr
                        key={`${
                          variant._id || `${variant.size}-${variant.color}`
                        }-${index}`}
                      >
                        <td>{variant.size}</td>
                        <td>{variant.color}</td>
                        <td>{variant.stock}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleVariantEdit(index)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVariantDelete(index)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

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
              accept="image/png, image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button type="button" onClick={handleColorChange}>
              Add Color Image
            </button>
          </div>

          <div className="productFormRight">
            <div className="productUpload">
              <img
                src={resolveImageUrl(product?.img)}
                alt=""
                className="productUploadImg"
              />
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
