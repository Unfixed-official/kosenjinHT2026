import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 16
  },
  section: {
    backgroundColor: '#181b22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2f3b'
  },
  title: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10
  },
  text: {
    color: '#d1d5db'
  },
  input: {
    backgroundColor: '#232938',
    color: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8
  },
  button: {
    backgroundColor: '#6ea8fe',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 6
  },
  buttonSecondary: {
    backgroundColor: '#2a2f3b'
  },
  buttonText: {
    color: '#0f1115',
    fontWeight: '700'
  },
  muted: {
    color: '#94a3b8',
    marginTop: 6
  },
  chip: {
    backgroundColor: '#232938',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8
  }
});
