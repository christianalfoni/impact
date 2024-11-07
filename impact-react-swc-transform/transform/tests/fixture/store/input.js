const UserProfile = () => {
  const user = useUserStore();
  return <div>{user.name}</div>;
};

const RegularComponent = () => {
  return <div>No store here</div>;
};

const CartWidget = () => {
  const cart = useCartStore();
  return <div>{cart.items.length}</div>;
};

function Counter4() {
  const state = useCounterStore();
  return <h1>Hello</h1>;
}

const RegularFunctionComponent = function () {
  const state = useCounterStore();
  return <h1>Hello</h1>;
};

const Counter6 = observer(function Counter6() {
  const state = useCounterStore();
  return <h1>Hello</h1>;
});

const Counter7 = __observer(function Counter7() {
  const state = useCounterStore();
  return <h1>Hello</h1>;
});

const Counter8 = function Counter8() {
  const state = useCounterStore();
};

export {
  UserProfile,
  RegularComponent,
  CartWidget,
  Counter4,
  RegularFunctionComponent,
  Counter6,
  Counter7,
  Counter8,
};
