import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Info: NextPage = () => {
	return (
		<>
			<Head>
				<title>Sleepy Maid Info</title>
			</Head>
			<h1>First Post</h1>
			<h2>
				<Link href="/">
					<a>Back to home</a>
				</Link>
			</h2>
		</>
	)
}

export default Info
