'use client'
import Link from 'next/link';
import { Card, Col, Container, Row } from 'react-bootstrap';
import useSWR, { Fetcher } from 'swr';
const ViewDetail = ({ params }: { params: { id: string } }) => {

    const fetcher: Fetcher<IBlog, string> = (url: string) => fetch(url).then((res) => res.json());
    const { data, error, isLoading } = useSWR(
        `http://localhost:8000/blogs/${params.id}`,
        fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    }
    );

    if (isLoading) {
        return <div>Loading ...</div>
    }


    return (
        <Container className="py-5">
            <Link href="/blogs" className="btn btn-outline-primary mb-4">
                ← Quay lại
            </Link>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <Row>
                        <Col md={12}>

                            <h1 className="mb-3">{data?.title}</h1>
                            <div className="text-muted mb-4">
                                <span className="me-3">
                                    {data?.author}
                                </span>
                                <span>
                                    Ngày đăng: 20/01/2025
                                </span>
                            </div>

                            <div className="blog-content">
                                {data?.content}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ViewDetail;