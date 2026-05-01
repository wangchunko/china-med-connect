import PublicLayout from "../(public)/layout";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}

