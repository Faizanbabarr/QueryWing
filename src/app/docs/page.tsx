import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-16 prose">
      <h1>Documentation</h1>
      <p>Embed the widget:</p>
      <pre>{`<script async src="https://cdn.querywing.com/widget.js" data-bot-id="YOUR_BOT_ID"></script>`}</pre>
      <p>See the <Link href="/demo" className="text-primary">demo</Link> for a live preview.</p>
    </div>
  )
}


