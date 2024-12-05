import React, { useEffect, useState } from "react";
import "./productList.css";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DeleteOutline } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, getProducts } from "../../redux/apiCalls";

interface Product {
  _id: string;
  title: string;
  img: string;
  inStock: boolean;
  price: number;
}

interface RootState {
  product: {
    products: Product[];
  };
}

const ProductList: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.product.products);

  // Estados para manejar la paginación y el tamaño de página
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    getProducts(dispatch);
  }, [dispatch]);

  const handleDelete = (id: string) => {
    deleteProduct(id, dispatch);
  };

  const columns: GridColDef[] = [
    { field: "_id", headerName: "ID", width: 220 },
    {
      field: "product",
      headerName: "Product",
      width: 400,
      renderCell: (params: {
        row: {
          img: string | undefined;
          title:
            | string
            | number
            | boolean
            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
            | Iterable<React.ReactNode>
            | React.ReactPortal
            | null
            | undefined;
        };
      }) => {
        return (
          <div className="productListItem">
            <img className="productListImg" src={params.row.img} alt="" />
            <span className="productTitleText">{params.row.title}</span>
          </div>
        );
      },
    },
    { field: "inStock", headerName: "Stock", width: 200 },
    {
      field: "price",
      headerName: "Price",
      width: 160,
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params: { row: { _id: string } }) => {
        return (
          <>
            <Link to={`/product/${params.row._id}`}>
              <button className="productListEdit">Edit</button>
            </Link>
            <DeleteOutline
              className="productListDelete"
              onClick={() => handleDelete(params.row._id as string)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="productList">
      <div className="productListTitleContainer">
        <h1 className="productListTitle">Products</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <DataGrid
        rows={products}
        disableSelectionOnClick
        columns={columns}
        getRowId={(row: { _id: any }) => row._id}
        initialState={{
          pagination: {
            pageSize: pageSize,
            page: 0, // Página inicial
          },
        }}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        pagination
        checkboxSelection
        pageSize={pageSize}
      />
    </div>
  );
};

export default ProductList;
