import styled from "styled-components";

export const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: flex-start;
    width: 500px;
`;

export const ListItem = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const Text = styled.p`
    margin-top: 20px;
    padding: 0;
`;

export const StyleList = styled.ul`
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    list-style: none;
    border: 1px solid #ddd;
    zIndex: 10;
    padding: 0;
    margin: 0;
`;