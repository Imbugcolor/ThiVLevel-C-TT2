import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import ProductItem from '../utils/productItem/ProductItem'
import Loading from '../utils/loading/Loading'
import axios from 'axios'
import Filters from './Filters'
import QuickViewProduct from '../home/QuickViewProduct'
import ReactPaginate from 'react-paginate'

function Products() {
  const state = useContext(GlobalState)
  const [products, setProducts] = state.productsAPI.productsAvailable
  const [categories] = state.categoriesAPI.categories
  const [category, setCategory] = state.productsAPI.category

  const [isAdmin] = state.userAPI.isAdmin
  const [token] = state.token
  const [callback, setCallback] = state.productsAPI.callback
  const [isCheck, setIsCheck] = useState(false)
  const [loading, setLoading] = state.productsAPI.loading
  const [currentProduct, setCurrentProduct] = useState(false)

  useEffect(() => {
    products.forEach(product => {
      product.checked = false
    })
    setProducts([...products])
  }, [])

  const handleCheck = (id) => {
    products.forEach(product => {
      if (product._id === id) product.checked = !product.checked
    })
    setProducts([...products])
  }


  const deleteProduct = async (id, public_id) => {
    try {


      const destroyImg = axios.post('/api/destroy', { public_id }, {
        headers: { Authorization: token }
      })
      const deleteProduct = axios.delete(`/api/products/${id}`, {
        headers: { Authorization: token }
      })

      await destroyImg
      await deleteProduct
      setCallback(!callback)
    } catch (err) {
      alert(err.response.data.msg)
    }
  }

  const checkAll = () => {
    products.forEach(product => {
      product.checked = !isCheck
    })
    setProducts([...products])
    setIsCheck(!isCheck)
  }

  // const deleteAll = () => {
  //   products.forEach(product => {
  //     if (product.checked) deleteProduct(product._id, product.images[0].public_id)
  //   })
  // }

  // Paginate
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 16;

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(products.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(products.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, products])

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
  };

  const handleCategoryChoose = (category) => {
    const value = "category=" + category._id
    setCategory(value)
    setItemOffset(0)
  }

  const handleViewDetail = (product) => {
    const viewbox = document.querySelector('.product-view-detail-box')
    viewbox.classList.toggle('active')
    setCurrentProduct(product)
  }

  // if(loading) return <div><Loading /></div>
  return (
    <>
      <Filters setItemOffset={setItemOffset} />
      {
        isAdmin &&
        <div className="delete-all">
          <span>Select all</span>
          <input type="checkbox" checked={isCheck} onChange={checkAll} />
          <button>Delete all</button>
        </div>
      }
      <div className="res-row products__container">
        <div className="col l-3 m-3 c-0 cate-side-bar">
          <div className="products__category">
            <h3 className="products__category-heading">Danh mục sản phẩm</h3>
            <ul>
              <li>
                <a href="#!" onClick={() => {
                  setCategory('')
                  setItemOffset(0)
                }}
                >
                  Tất cả sản phẩm
                </a>
              </li>
              {
                categories.map((category) => (
                  <li key={category._id}>
                    <a href="#!" onClick={() => handleCategoryChoose(category)}>
                      {category.name}
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        
        <div className="col l-9 m-9 c-12">
        {
          loading ? <div><Loading/></div> : 
          <div>
          <div className="products res-row">
            {
              currentItems.length === 0 ?
                <div className='items-not-found-title'><h2 className="no-results">Không tìm thấy kết quả tìm kiếm.</h2></div> :
                currentItems.map(product => {
                  return <ProductItem key={product._id} product={product}
                    isAdmin={isAdmin} deleteProduct={deleteProduct} handleCheck={handleCheck}
                    setCurrentProduct={setCurrentProduct}
                    handleViewDetail={handleViewDetail}
                  />
                })
            }
          </div>
          <div>
            <ReactPaginate
              breakLabel="..."
              nextLabel=">"
              onPageChange={handlePageClick}
              pageRangeDisplayed={2}
              pageCount={pageCount}
              previousLabel="<"
              renderOnZeroPageCount={null}
              containerClassName="pagination"
              pageLinkClassName="page-num"
              previousLinkClassName="page-num"
              activeClassName="active"
            />
          </div>
          </div>
          }
        </div>

        <div className="product-view-detail-box">
          {currentProduct && <QuickViewProduct detailProduct={currentProduct} />}
        </div>
      </div>


    </>
  )
}

export default Products