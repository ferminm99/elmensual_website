import styled from "styled-components";

const Container = styled.div`
  height: 40px;
  background-color: teal;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500px;
`;

const Announcement: React.FC = () => {
  return <Container>Bombachas de poplin en oferta!</Container>;
};

export default Announcement;
