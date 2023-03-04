import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../../GlobalState'

function SearchBar() {

    const state = useContext(GlobalState)
    const [data, setData] = state.productsAPI.suggestions
    const [filterData, setFilterData] = useState([])
    const [wordEntered, setWordEntered] = useState('')
    

    const [open, setOpen] = useState(false)

    const handleSearch = (e, keySearch) => {
        if (e.key === 'Enter') {
            setWordEntered(keySearch)
            setOpen(false)
        }
    }


    const handleSuggest = e => {
        setOpen(true)
        const searchWord = e.target.value
        setWordEntered(searchWord)
        const newFilter = data.filter((product) => {
            return product.title.toLowerCase().includes(searchWord.toLowerCase())
        })
        // setSuggestions(e.target.value.toLowerCase())
        if(searchWord === '') {
            setFilterData([])
        } else {
            setFilterData(newFilter)
        }
        
    }
    return (
        <div className="filter_menu product">

            <div className="search search__bar_wrapper" >
                <input className="search-input-bd-none search__bar_input" type="text" placeholder="Nhập sản phẩm bạn muốn tìm kiếm ..."
                    value={wordEntered}
                    onKeyPress={(e) => {handleSearch(e,wordEntered)}}
                    onChange={handleSuggest}
                    onFocus={() => setOpen(true)}
                    onBlur={e => {
                        e.relatedTarget?.classList.contains('result-link') ?
                            e.preventDefault() :
                            setOpen(false)
                    }}
                />
          
                {
                    open && filterData.length > 0 ?
                        <ul className="result-list">
                            {
                                filterData.map((item, index) => {
                                    return index > 4 ? null :
                                        <li key={item._id} className="result-item">
                                            <a href="#!" className="result-link" onClick={(e) => {
                                                setWordEntered(e.target.innerText)                                            
                                                setOpen(false)
                                            }}>
                                                {item.title}
                                            </a>
                                        </li>
                                })
                            }
                        </ul>
                        : null
                }
            </div>

        </div >
    )
}

export default SearchBar

