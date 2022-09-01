import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js"
import axios from "axios"

const client = new Web3Storage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEE0MDk2MjJERmU3MDZjNzY3OUExOUM5NzU4Qjc3QzJmN2E4MjlkOTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjIwMjg2MjQwNzYsIm5hbWUiOiJjZWxvTmZ0RGVtbyJ9.VbInbK1Ud2MHgzuOEmgHH-VWQq7XJv9Q0-gdvC-wOOA",
})
// ...
export const createNft = async (
  minterContract,
  performActions,
  { name, description, ipfsImage, ownerAddress, attributes }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return
    const { defaultAccount } = kit

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage,
      owner: defaultAccount,
      attributes,
    })

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data)

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`

      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .safeMint(ownerAddress, url)
        .send({ from: defaultAccount })

      return transaction
    } catch (error) {
      console.log("Error uploading file: ", error)
    }
  })
}
// ...
export const uploadFileToWebStorage = async (e) => {
  // Construct with token and endpoint

  const file = e.target.files
  if (!file) return
  // Pack files into a CAR and send to web3.storage
  const rootCid = await client.put(file) // Promise<CIDString>

  // Fetch and verify files from web3.storage
  const res = await client.get(rootCid) // Promise<Web3Response | null>
  const files = await res.files() // Promise<Web3File[]>

  return `https://ipfs.infura.io/ipfs/${files[0].cid}`
}
export const getNfts = async (minterContract) => {
  try {
    const nfts = []
    const nftsLength = await minterContract.methods.totalSupply().call()
    for (let i = 0; i < Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const res = await minterContract.methods.tokenURI(i).call()
        const meta = await fetchNftMeta(res)
        const owner = await fetchNftOwner(minterContract, i)
        resolve({
          index: i,
          owner,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        })
      })
      nfts.push(nft)
    }
    return Promise.all(nfts)
  } catch (e) {
    console.log({ e })
  }
}
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null
    const meta = await axios.get(ipfsUrl)
    return meta
  } catch (e) {
    console.log({ e })
  }
}
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call()
  } catch (e) {
    console.log({ e })
  }
}

export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call()
    return owner
  } catch (e) {
    console.log({ e })
  }
}
