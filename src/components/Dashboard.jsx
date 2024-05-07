import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa";
import { IoIosNotificationsOutline } from "react-icons/io";
import { TiMessages } from "react-icons/ti";
import useGetTransactions from "./Hooks/useGetTransactions";
import { DotLoader } from "react-spinners"
import TransactionTable from "./Utils/TransactionTable";
const Dashboard = () => {
    const [userEntry, setUserEntry] = useState("")
    const [searchPrincipal, setSearchPrincipal] = useState(null)
    const [selectedToken, setSelectedToken] = useState(null);
    const { getICPBalance, getTokenInfo, getUserTokenTransactions, tokenTransactions, tokenInformation, userBalances, isFectingData, userICPTransactions, userckTransactions } = useGetTransactions()

    const handleSearch = () => {
        setSearchPrincipal(userEntry)
    }
    useEffect(() => {
        if (!searchPrincipal) return
        getICPBalance(searchPrincipal)
    }, [searchPrincipal])

    useEffect(() => {
        getTokenInfo(selectedToken)
        getUserTokenTransactions(selectedToken, searchPrincipal)
    }, [selectedToken])

    console.log("token transactions :", tokenTransactions);


    return (
        <div className="w-full flex h-screen flex-col  p-1">
            <div className="flex text-white w-full items-center justify-between h-20 p-4 shadow-lg shadow-black bg-slate-400">
                {/*logo */}
                <div className="flex justify-between items-center gap-4">
                    <img
                        src="https://a2ede-rqaaa-aaaal-ai6sq-cai.raw.icp0.io/uploads/cat2.2392.2500.jpg"
                        alt="Logo"
                        className="rounded-xl h-14 w-14"
                    />
                    <h4 onClick={() => { setSearchPrincipal(null); setUserEntry("") }} className="hover:cursor-pointer hover:font-bold">IC-Explorer</h4>
                </div>
                {/* search bar */}
                <div
                    style={{ backgroundColor: '#2D3348' }}
                    className="flex gap-2 w-1/2 px-4 justify-between items-center rounded-md focus:outline-none focus:ring-2 focus: "
                >
                    <input
                        value={userEntry}
                        onChange={(e) => setUserEntry(e.target.value)}
                        name="userEntry"
                        type="text"
                        placeholder="Enter your Principal ID"
                        className="w-4/5 rounded-full focus:outline-none px-2 focus:bg-none h-10"
                        style={{ backgroundColor: '#2D3348' }}
                    />
                    <FaSearch
                        className="hover:cursor-pointer text-white"
                        onClick={handleSearch}
                    />
                </div>
                <div className="flex justify-center items-center gap-2 p-4">
                    <IoIosNotificationsOutline size={35} className="hover:cursor-pointer" />
                    <TiMessages size={35} className="hover:cursor-pointer" />
                </div>
            </div>
            {/* body of the dashboard */}
            <div className="flex justify-center m-1 w-full h-[550px]">
                {
                    searchPrincipal ?

                        isFectingData ? <DotLoader size={25} color="white" /> :


                            <div className="flex w-full gap-2 mt-4">
                                <div
                                    style={{ backgroundColor: '#1D1F31' }}
                                    className="flex flex-col w-1/4 rounded-md shadow-sm h-full p-4 "
                                >
                                    <div
                                        style={{ color: '#4A68B9' }}
                                        className="flex justify-center items-center p-2"
                                    >
                                        <h3>Token Balances</h3>
                                    </div>
                                    <div className="px-4">
                                        {userBalances &&
                                            userBalances?.map((data, index) => (
                                                <div key={index} className="flex flex-col gap-1 border-b-2 shadow-md bg-yellow-400 shadow-black mt-2 hover:cursor-pointer"
                                                    onClick={() => setSelectedToken(data)}
                                                >
                                                    <span className="text-xl">{data.token_symbol}</span>
                                                    <span>{data.amount}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                <div className="flex flex-col w-3/4 rounded-md shadow-md h-full px-4">
                                    <div className>

                                        {tokenInformation && (
                                            <div className="flex justify-between items-center border p-2">
                                                <div
                                                    style={{ backgroundColor: '#1D1F31' }}
                                                    className="flex flex-col rounded-sm justify-center px-4 items-center py-2 "
                                                >
                                                    <span style={{ color: '#4A68B9' }}>Token</span>
                                                    <span>{tokenInformation[0]?.symbol}</span>
                                                </div>
                                                <div
                                                    style={{ backgroundColor: '#1D1F31' }}
                                                    className="flex flex-col justify-center rounded-sm items-center px-4 py-2 "
                                                >
                                                    <span style={{ color: '#4A68B9' }}>Price</span>
                                                    <span>{tokenInformation[0]?.price_USD}</span>
                                                </div>
                                                <div
                                                    style={{ backgroundColor: '#1D1F31' }}
                                                    className="flex flex-col justify-center rounded-sm items-center px-4 py-2 "
                                                >
                                                    <span style={{ color: '#4A68B9' }}>Volume(USD)</span>
                                                    <span>{tokenInformation[0]?.volume_USD}</span>
                                                </div>
                                                <div
                                                    style={{ backgroundColor: '#1D1F31' }}
                                                    className="flex flex-col justify-center rounded-sm items-center px-4 py-2 "
                                                >
                                                    <span style={{ color: '#4A68B9' }}>Marketcap(USD)</span>
                                                    <span>{tokenInformation[0]?.marketcap_USD}</span>
                                                </div>
                                                <div
                                                    style={{ backgroundColor: '#1D1F31' }}
                                                    className="flex flex-col justify-center rounded-sm items-center px-4 py-2 "
                                                >
                                                    <span style={{ color: '#4A68B9' }}>Total Supply</span>
                                                    <span>{tokenInformation[0]?.total}</span>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    <div
                                        style={{ backgroundColor: '#1D1F31', maxHeight: '290px' }}
                                        className="flex py-4 mt-4 rounded-sm overflow-x-auto"
                                    >
                                        {tokenTransactions?.length > 0 ? (
                                            <TransactionTable
                                                data={tokenTransactions}
                                                tokenName={selectedToken}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center w-full">
                                                No transaction history found
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        :
                        <div className=" text-white flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold mb-4">
                                    Welcome to IC Explorer
                                </h1>
                                <p className="text-lg mb-8">
                                    Explore and gain token insights the Internet Computer Blockchain with our explorer
                                </p>
                                <a
                                    href="/kkk"
                                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                                >
                                    Get Started
                                </a>
                            </div>
                        </div>
                }
            </div>
        </div>

    )
}

export default Dashboard



