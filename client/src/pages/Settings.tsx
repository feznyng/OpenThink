import ConstructionMessage from '../components/Shared/ConstructionMessage/ConstructionMessage';

export default function Settings() {
  return (
    <div style={{textAlign: 'left'}}>
      <ConstructionMessage
        features={[
          {title: 'See all account information'},
          {title: 'Adjust global notification settings'},
          {title: 'Reset your password'},
        ]}
      />
    </div>
  );
}
